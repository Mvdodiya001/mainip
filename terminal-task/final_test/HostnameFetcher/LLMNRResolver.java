import java.io.ByteArrayOutputStream;
import java.io.Closeable;
import java.io.DataOutputStream;
import java.io.IOException;
import java.net.DatagramPacket;
import java.net.InetAddress;
import java.net.MulticastSocket;

public class LLMNRResolver implements Closeable {

    InetAddress llmnrIP = InetAddress.getByName("224.0.0.252");
	private int llmnrPort = 5355;
	MulticastSocket socket = new MulticastSocket();

    public LLMNRResolver(int timeout) throws IOException {
		socket.setSoTimeout(timeout);
		socket.setTimeToLive(1);
	}
    
    String createPTRQuery(byte[] addr) {
      return (addr[3]&0xFF) + "." + (addr[2]&0xFF) + "." + (addr[1]&0xFF) + "." + (addr[0]&0xFF) + ".in-addr.arpa";
    }
   
    byte[] dnsRequest(int id, String name) throws IOException {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        DataOutputStream out = new DataOutputStream(baos);
        out.writeShort(id);
        out.write(new byte[] {0, 0, 0, 1, 0, 0, 0, 0, 0, 0});
        writeName(out, name);
        out.write(new byte[] {0, 0xc, 0, 1});
        return baos.toByteArray();
    }

    void writeName(DataOutputStream out, String name) throws IOException {
		int s = 0, e;
		while ((e = name.indexOf('.', s)) != -1) {
			out.writeByte(e - s);
			out.write(name.substring(s, e).getBytes());
			s = e + 1;
		}
		out.write(name.length() - s);
		out.write(name.substring(s).getBytes());
		out.writeByte(0);
	}

    String decodeName(byte[] data, int offset, int length) {
		StringBuilder s = new StringBuilder(length);
		for (int i = offset; i < offset + length; i++) {
			byte len = data[i];
			if (len == 0) break;
			s.append(new String(data, i + 1, len)).append('.');
			i += len;
		}
		s.setLength(s.length() - 1);
		return s.toString();
	}

    public String resolve(InetAddress ip) throws IOException {
		byte[] addr = ip.getAddress();
		int requestId = addr[2] * 0xFF + addr[3];
		byte[] request = dnsRequest(requestId, createPTRQuery(addr));
		socket.send(new DatagramPacket(request, request.length, llmnrIP, llmnrPort));

		DatagramPacket respPacket = new DatagramPacket(new byte[512], 512);
		socket.receive(respPacket);
		byte[] response = respPacket.getData();
		if (response[0] != request[0] && response[1] != request[1]) return null;
		int numQueries = response[5];
		int offset = (numQueries == 0 ? 12 : request.length) + 2 + 2 + 2 + 4 + 2;
		return decodeName(response, offset, respPacket.getLength() - offset);
	}
	
    public void close() {
		socket.close();
	}
}
