#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>
#include <fcntl.h>
#include <errno.h>
#include <sys/socket.h>
#include <sys/types.h>
#include <netinet/ip.h>
#include <netinet/udp.h>
#include <netinet/in.h>
#include <netinet/ip_icmp.h>
#include <netinet/icmp6.h>
#include <arpa/inet.h>
#include <sys/time.h>
#include <netdb.h>

#define TIMEOUT 3
#define MAX_PROBES 66

struct UdpServiceProbe {
    int port;
    const char *service_name;
    const char *probe_data;
    int probe_len;
};

struct UdpServiceProbe probes[MAX_PROBES] = {
    {7, "Echo", "PingEcho", 8},
    {9, "Discard", "Test", 4},
    {17, "QOTD", "Quote", 5},
    {19, "Chargen", "Chargen", 7},
    {37, "Time", "Time", 4},
    {53, "Domain Name System", "\x12\x34\x01\x00\x00\x01\x00\x00\x00\x00\x00\x00\x03www\x06google\x03com\x00\x00\x01\x00\x01", 33},
    {67, "DHCP Server", "DHCP Server", 11},
    {68, "DHCP Client", "DHCP Client", 11},
    {69, "TFTP", "\x00\x01test\x00octet\x00", 13},
    {88, "Kerberos", "Test", 4},
    {111, "RPCbind", "RPC", 3},
    {123, "NTP", "\xe3\x00\x04\xfa\x00\x00\x00\x01", 8},
    {137, "NetBIOS Name", "NBNS", 4},
    {138, "NetBIOS Datagram", "NBDG", 4},
    {161, "SNMP", "\x30\x26\x02\x01\x01\x04\x06\x70\x75\x62\x6c\x69\x63\xa0\x19\x02\x04\x71\x46\x4c\x7d\x02\x01\x00\x02\x01\x00\x30\x0b\x30\x09\x06\x05\x2b\x06\x01\x02\x01\x05\x00", 40},
    {162, "SNMP Trap", "Trap", 4},
    {177, "XDMCP", "XDMCP", 5},
    {213, "IPX", "IPX", 3},
    {427, "SLP", "SLP", 3},
    {500, "ISAKMP", "ISAKMP", 6},
    {514, "Syslog", "Test log", 8},
    {517, "Talk", "Talk", 4},
    {520, "RIP", "RIP", 3},
    {546, "DHCPv6 Client", "DHCPv6 Client", 13},
    {547, "DHCPv6 Server", "DHCPv6 Server", 13},
    {548, "AFP over TCP", "AFP", 3},
    {563, "NNTP over SSL", "NNTP", 4},
    {623, "IPMI", "IPMI", 4},
    {626, "SerialNumberD", "Serial", 6},
    {631, "IPP", "IPP", 3},
    {749, "Kerberos Admin", "KAdmin", 6},
    {843, "Flash Policy", "Flash", 5},
    {860, "iSCSI", "iSCSI", 5},
    {989, "FTPS-Data", "FTPS", 4},
    {990, "FTPS", "FTPS", 4},
    {1024, "Reserved", "Test", 4},
    {1194, "OpenVPN", "VPN", 3},
    {1434, "MS SQL Monitor", "SQL", 3},
    {1645, "RADIUS (old)", "Old RADIUS", 10},
    {1646, "RADIUS Acct (old)", "Old SRADIUS Acct", 15},
    {1701, "L2TP", "L2TP", 4},
    {1718, "H.323 Discovery", "H323", 4},
    {1719, "H.323 Status", "H323", 4},
    {1812, "RADIUS", "RADIUS", 6},
    {1813, "RADIUS Acct", "RADIUS Acct", 11},
    {1900, "SSDP", "SSDP", 4},
    {2049, "NFS", "NFS", 3},
    {3478, "STUN", "STUN", 4},
    {3479, "TURN", "TURN", 4},
    {4500, "IPSec NAT-T", "IPSec", 5},
    {5004, "RTP", "RTP", 3},
    {5005, "RTCP", "RTCP", 4},
    {5060, "SIP", "SIP", 3},
    {5061, "SIPS", "SIPS", 4},
    {5353, "mDNS", "mDNS", 4},
    {5631, "PCAnywhere", "PCAny", 5},
    {10000, "Webmin", "Webmin", 6},
    {11211, "Memcached", "Cache", 5},
    {12345, "NetBus", "NetBus", 6},
    {17185, "VXLAN", "VXLAN", 5},
    {20031, "NetVault", "Vault", 5},
    {27017, "MongoDB", "Mongo", 5},
    {33434, "Traceroute", "Trace", 5},
    {47808, "BACnet", "BACnet", 6},
    {49152, "Dynamic/private port", "Dyn", 3},
    {65535, "Dynamic/private port", "Dyn", 3}
};

void send_udp_probe_v4(int sock, struct sockaddr_in *target, struct UdpServiceProbe *probe) {
    if (probe->probe_len > 0) {
        sendto(sock, probe->probe_data, probe->probe_len, 0, (struct sockaddr *)target, sizeof(*target));
    } else {
        char dummy = 0x00;
        sendto(sock, &dummy, 1, 0, (struct sockaddr *)target, sizeof(*target));
    }
}

void send_udp_probe_v6(int sock, struct sockaddr_in6 *target, struct UdpServiceProbe *probe) {
    if (probe->probe_len > 0) {
        sendto(sock, probe->probe_data, probe->probe_len, 0, (struct sockaddr *)target, sizeof(*target));
    } else {
        char dummy = 0x00;
        sendto(sock, &dummy, 1, 0, (struct sockaddr *)target, sizeof(*target));
    }
}

int receive_response_v4(int udp_sock, int icmp_sock, int port, int verbose) {
    fd_set readfds;
    struct timeval timeout = {TIMEOUT, 0};
    FD_ZERO(&readfds);
    FD_SET(udp_sock, &readfds);
    FD_SET(icmp_sock, &readfds);
    int maxfd = udp_sock > icmp_sock ? udp_sock : icmp_sock;

    int ret = select(maxfd + 1, &readfds, NULL, NULL, &timeout);
    sleep(1);

    if (ret < 0) {
        perror("select error");
        return -1;
    } else if (ret == 0) {
        return 3; // OPEN|FILTERED (no response)
    }

    if (FD_ISSET(icmp_sock, &readfds)) {
        char buffer[1024];
        struct sockaddr_in from;
        socklen_t len = sizeof(from);
        int recv_len = recvfrom(icmp_sock, buffer, sizeof(buffer), 0, (struct sockaddr *)&from, &len);

        if (recv_len >= (int)(sizeof(struct iphdr) + sizeof(struct icmphdr))) {
            struct iphdr *ip = (struct iphdr *)buffer;
            struct icmphdr *icmp = (struct icmphdr *)(buffer + (ip->ihl * 4));

            if (icmp->type == 3) { // Destination Unreachable
                switch (icmp->code) {
                    case 3: // Port Unreachable
                        if (verbose) printf("Port %d: CLOSED (ICMP Port Unreachable)\n", port);
                        return 0;
                    case 13: // Communication Administratively Prohibited (filtered)
                        if (verbose) printf("Port %d: FILTERED (Admin Prohibited)\n", port);
                        return 1;
                    default:
                        if (verbose) printf("Port %d: FILTERED (ICMP code %d)\n", port, icmp->code);
                        return 1;
                }
            }
        }
    }

    if (FD_ISSET(udp_sock, &readfds)) {
        char buffer[1024];
        struct sockaddr_in from;
        socklen_t len = sizeof(from);
        int recv_len = recvfrom(udp_sock, buffer, sizeof(buffer) - 1, 0, (struct sockaddr *)&from, &len);
        if (recv_len > 0) {
            if (verbose) printf("Port %d: OPEN (UDP response)\n", port);
            return 2;
        }
    }

    return 3; // OPEN|FILTERED by default if no definitive ICMP or UDP response
}

int receive_response_v6(int udp_sock, int icmp6_sock, int port, int verbose) {
    fd_set readfds;
    struct timeval timeout = {TIMEOUT, 0};
    FD_ZERO(&readfds);
    FD_SET(udp_sock, &readfds);
    FD_SET(icmp6_sock, &readfds);
    int maxfd = udp_sock > icmp6_sock ? udp_sock : icmp6_sock;

    int ret = select(maxfd + 1, &readfds, NULL, NULL, &timeout);
    sleep(1);

    if (ret < 0) {
        perror("select error");
        return -1;
    } else if (ret == 0) {
        return 3; // OPEN|FILTERED (no response)
    }

    if (FD_ISSET(icmp6_sock, &readfds)) {
        char buffer[1024];
        struct sockaddr_in6 from;
        socklen_t len = sizeof(from);
        int recv_len = recvfrom(icmp6_sock, buffer, sizeof(buffer), 0, (struct sockaddr *)&from, &len);

        if (recv_len >= (int)sizeof(struct icmp6_hdr)) {
            struct icmp6_hdr *icmp6 = (struct icmp6_hdr *)buffer;

            if (icmp6->icmp6_type == 1) { // ICMPv6 Destination Unreachable
                // Code 4 = Port Unreachable
                switch (icmp6->icmp6_code) {
                    case 4:
                        if (verbose) printf("Port %d: CLOSED (ICMPv6 Port Unreachable)\n", port);
                        return 0;
                    default:
                        if (verbose) printf("Port %d: FILTERED (ICMPv6 code %d)\n", port, icmp6->icmp6_code);
                        return 1;
                }
            }
        }
    }

    if (FD_ISSET(udp_sock, &readfds)) {
        char buffer[1024];
        struct sockaddr_in6 from;
        socklen_t len = sizeof(from);
        int recv_len = recvfrom(udp_sock, buffer, sizeof(buffer) - 1, 0, (struct sockaddr *)&from, &len);
        if (recv_len > 0) {
            if (verbose) printf("Port %d: OPEN (UDP response)\n", port);
            return 2;
        }
    }

    return 3; // OPEN|FILTERED by default if no definitive ICMP or UDP response
}

int main(int argc, char *argv[]) {
    if (argc < 2 || argc > 3) {
        printf("Usage: %s <target-ip> [-v]\n", argv[0]);
        return 1;
    }

    int verbose = 0;
    if (argc == 3 && strcmp(argv[2], "-v") == 0) {
        verbose = 1;
    }

    const char *target_ip = argv[1];

    // Detect if IPv4 or IPv6
    struct in_addr ipv4_addr;
    struct in6_addr ipv6_addr;
    int is_ipv4 = 0, is_ipv6 = 0;

    if (inet_pton(AF_INET, target_ip, &ipv4_addr) == 1) {
        is_ipv4 = 1;
    } else if (inet_pton(AF_INET6, target_ip, &ipv6_addr) == 1) {
        is_ipv6 = 1;
    } else {
        fprintf(stderr, "Invalid IP address: %s\n", target_ip);
        return 1;
    }

    int udp_sock_v4 = -1, udp_sock_v6 = -1;
    int icmp_sock_v4 = -1, icmp_sock_v6 = -1;

    if (is_ipv4) {
        udp_sock_v4 = socket(AF_INET, SOCK_DGRAM, 0);
        if (udp_sock_v4 < 0) {
            perror("UDP socket creation failed");
            return 1;
        }

        icmp_sock_v4 = socket(AF_INET, SOCK_RAW, IPPROTO_ICMP);
        if (icmp_sock_v4 < 0) {
            perror("ICMP raw socket creation failed (run with sudo or setcap)");
            close(udp_sock_v4);
            return 1;
        }
    } else if (is_ipv6) {
        udp_sock_v6 = socket(AF_INET6, SOCK_DGRAM, 0);
        if (udp_sock_v6 < 0) {
            perror("UDP IPv6 socket creation failed");
            return 1;
        }

        icmp_sock_v6 = socket(AF_INET6, SOCK_RAW, IPPROTO_ICMPV6);
        if (icmp_sock_v6 < 0) {
            perror("ICMPv6 raw socket creation failed (run with sudo or setcap)");
            close(udp_sock_v6);
            return 1;
        }
    }

    printf("Scanning UDP services on %s...\n", target_ip);
    printf("PORT\t STATE\t\tSERVICE\n");

    for (int i = 0; i < MAX_PROBES; i++) {
        int port = probes[i].port;

        if (is_ipv4) {
            struct sockaddr_in target;
            memset(&target, 0, sizeof(target));
            target.sin_family = AF_INET;
            target.sin_port = htons(port);
            memcpy(&target.sin_addr, &ipv4_addr, sizeof(ipv4_addr));

            send_udp_probe_v4(udp_sock_v4, &target, &probes[i]);
            int res = receive_response_v4(udp_sock_v4, icmp_sock_v4, port, verbose);
            if (res == 0) {
                printf("%d\tCLOSED\t\t", port);
            } else if (res == 1) {
                printf("%d\tFILTERED\t", port);
            } else if (res == 2) {
                printf("%d\tOPEN\t\t", port);
            } else if (res == 3) {
                printf("%d\tOPEN|FILTERED\t", port);
            }
            printf("%s\n", probes[i].service_name);
        } else if (is_ipv6) {
            struct sockaddr_in6 target6;
            memset(&target6, 0, sizeof(target6));
            target6.sin6_family = AF_INET6;
            target6.sin6_port = htons(port);
            memcpy(&target6.sin6_addr, &ipv6_addr, sizeof(ipv6_addr));

            send_udp_probe_v6(udp_sock_v6, &target6, &probes[i]);
            int res = receive_response_v6(udp_sock_v6, icmp_sock_v6, port, verbose);
            if (res == 0) {
                printf("%d\tCLOSED\t\t", port);
            } else if (res == 1) {
                printf("%d\tFILTERED\t", port);
            } else if (res == 2) {
                printf("%d\tOPEN\t\t", port);
            } else if (res == 3) {
                printf("%d\tOPEN|FILTERED\t", port);
            }
            printf("%s\n", probes[i].service_name);
        }

        usleep(100000);  // 100 ms between probes
    }

    if (udp_sock_v4 >= 0) close(udp_sock_v4);
    if (icmp_sock_v4 >= 0) close(icmp_sock_v4);
    if (udp_sock_v6 >= 0) close(udp_sock_v6);
    if (icmp_sock_v6 >= 0) close(icmp_sock_v6);

    return 0;
}

// Running commands:
// gcc <filename.c> -o <filename>
// sudo ./<filename> <ip_addr>