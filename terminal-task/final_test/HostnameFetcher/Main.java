import java.util.Scanner;
import java.util.ArrayList;
import java.util.List;

public class Main {

    public static void main(String[] args) {
        if(args.length != 1) {
            System.out.println("Usage: java Main <ip_address>");
            return;
        }

        Scanner scanner = new Scanner(System.in);

        // System.out.println("Select input type: ");
        // System.out.println("1: Network Prefix");
        // System.out.println("2: Subnet CIDR");
        
        // int choice = scanner.nextInt();
        int choice = 3;
        // scanner.nextLine();  // Consume newline left-over

        List<String> ipAddresses = new ArrayList<>();

        switch (choice) {
            case 1:
                // System.out.print("Enter Network Prefix (e.g., 172.19.13.): ");
                // String networkPrefix = scanner.nextLine();
                String networkPrefix = args[0];
                // System.out.print("Enter start: ");
                // int start=scanner.nextInt(); 
                int start = Integer.parseInt(args[1]);
                // System.out.print("Enter end: ");
                // int end=scanner.nextInt();
                int end = Integer.parseInt(args[2]);
                for (int i = start; i<=end; i++) {
                    ipAddresses.add(networkPrefix + i);
                }
                break;

            case 2:
                // System.out.print("Enter CIDR (e.g., 172.19.14.0/24): ");
                // String cidr = scanner.nextLine();
                String cidr = args[0];
                ipAddresses = getIPsFromCIDR(cidr);
                break;

            case 3:
                // System.out.print("Enter IP Address (e.g., 172.19.14.249): ");
                // String ipAddress = scanner.nextLine();
                String ipAddress = args[0];
                ipAddresses.add(ipAddress);
                break;

            default:
                System.out.println("Invalid choice!");
                scanner.close();
                return;
        }

        scanner.close();

        HostnameFetcher fetcher = new HostnameFetcher();

        for (String ipAddress : ipAddresses) {
            String hostname = fetcher.resolveHostname(ipAddress);
            if (hostname != null) {
                // System.out.println("IP Address: " + ipAddress + " -> Hostname: " + hostname);
                System.out.println(hostname);
            }
             else {
                // System.out.println("Unable to resolve hostname for IP: " + ipAddress);
                System.out.println("Not Found");
            }
        }
    }

    private static List<String> getIPsFromCIDR(String cidr) {
        String[] parts = cidr.split("/");
        int ip = 0;
        String[] ipParts = parts[0].split("\\.");
        for (int i = 0; i < 4; i++) {
            ip |= Integer.parseInt(ipParts[i]) << (24 - (8 * i));
        }

        int netmaskInt = Integer.parseInt(parts[1], 10);
        int mask = -1 << (32 - netmaskInt);

        int network = ip & mask;
        int broadcast = network | (~mask);

        List<String> result = new ArrayList<>();
        for (int currentIP = network; currentIP <= broadcast; currentIP++) {
            result.add(String.format("%d.%d.%d.%d",
                    (currentIP >>> 24) & 0xFF,
                    (currentIP >>> 16) & 0xFF,
                    (currentIP >>> 8) & 0xFF,
                    currentIP & 0xFF));
        }
        return result;
    }
}

