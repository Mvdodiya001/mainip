import java.net.InetAddress;
import java.net.SocketException;
import java.net.SocketTimeoutException;
import java.net.UnknownHostException;

public class HostnameFetcher{

	public HostnameFetcher() {}
	
	private String resolveWithLLMNR(InetAddress ip) {
		try {
			LLMNRResolver resolver = new LLMNRResolver(1000);
			String name = resolver.resolve(ip);
			resolver.close();
			return name;
		}
		catch (SocketTimeoutException | SocketException e) {
			return null;
		}
		catch (Exception e) {
			return null;
		}
	}

	private String resolveWithMulticastDNS(InetAddress ip) {
		try {
			MDNSResolver resolver = new MDNSResolver(1000);
			String name = resolver.resolve(ip);
			resolver.close();
			return name;
		}
		catch (SocketTimeoutException | SocketException e) {
			return null;
		}
		catch (Exception e) {
			return null;
		}
	}

	private String resolveWithNetBIOS(InetAddress ip) {
		try {
			NetBIOSResolver resolver = new NetBIOSResolver(1000);
			String[] names = resolver.resolve(ip);
			resolver.close();
			return names == null ? null : names[0];
		}
		catch (SocketTimeoutException | SocketException e) {
			return null;
		}
		catch (Exception e) {
			return null;
		}
	}

	public String resolveHostname(String ipAddress) {
		try {
			InetAddress ip = InetAddress.getByName(ipAddress);
			
			// String name = resolveWithMulticastDNS(ip);
			String name = resolveWithLLMNR(ip);
			if (name == null) name = resolveWithMulticastDNS(ip);
			if (name == null) name = resolveWithNetBIOS(ip);
			return name;
		} catch (UnknownHostException e) {
			System.out.println("error occured " + e);
			return null;
		}
	}
}
