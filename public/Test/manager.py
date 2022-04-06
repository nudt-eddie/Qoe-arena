#coding=utf8
import paramiko,getpass
import argparse
import os
from scp import SCPClient
import threading
import prettytable as pt
import time

client_ssh = ''
server_ssh = ''
client_scp = '' 
server_scp = ''
tb = pt.PrettyTable()
tb2 = pt.PrettyTable()
tb.field_names = ["组别", "耗时", "server端文件md5", "client端文件md5", "md5检测"]
tb2.field_names = ["id", "time", "server's md5", "client's md5", "md5check"]
def ssh_connect(host_ip, user_name, password):
    '''
    host_ip = '192.168.0.150'
    user_name = 'root'
    host_port ='22'

    # 待执行的命令
    sed_command = "sed -i 's/123/abc/g' /root/test/test.txt"
    ls_command = "ls /root/test/"

    # 注意：依次执行多条命令时，命令之间用分号隔开
    command = sed_command+";"+ls_command
    '''
    # SSH远程连接
    ssh = paramiko.SSHClient()   
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())  #指定当对方主机没有本机公钥的情况时应该怎么办，AutoAddPolicy表示自动在对方主机保存下本机的秘钥
    ssh.connect(host_ip, '22', user_name, password)
    
    return ssh

def exec_command(ssh_connection, command):
    # 执行命令并获取执行结果
    stdin, stdout, stderr = ssh_connection.exec_command(command)
    out = stdout.read()
    err = stderr.read()
    
    return (out, err)
def close_ssh(ssh_connection):
    ssh_connection.close()

def one_test(client_filepath, server_filepath, test_name):

    global client_ssh, server_ssh, client_scp, server_scp, tb
    # upload student's code to the client and server
    print("Running:" , test_name)
    try:
        client_scp.put(client_filepath, "client.py")
        server_scp.put("./file_generation.py", "~/file_generation.py")
        server_scp.put(server_filepath, "server.py")
    except FileNotFoundError as e:
        
        print("Cannot find the file" + local_path)
    else:
        print("File upload success")

    # start execution

    # generate a random file
    exec_command(server_ssh, "python3 file_generation.py generate_random_char -s 0.5")

    # server run
    
    def server_run():
        server_out = exec_command(server_ssh, "python3 ~/server.py")
    server_thread = threading.Thread(target=server_run)
    server_thread.start()
    
    # client run
    
    time.sleep(1)
    start = time.perf_counter()
    client_exec_result = exec_command(client_ssh, "python3 ~/client.py")
    end = time.perf_counter()
    time_spent = end - start

    if client_exec_result[1] != b'':
        print("Connection error:")
        print(client_exec_result)
        exec_command(server_ssh, "pkill python3")
        exec_command(client_ssh, "pkill python3")
        exit(0)
    print(time_spent)
    # check the md5
    file_md5_on_client = exec_command(client_ssh, "md5sum ~/output.bin")[0].split()[0]
    file_md5_on_server = exec_command(server_ssh, "md5sum ~/output.bin")[0].split()[0]
    tb.add_row([test_name, str(time_spent), file_md5_on_server, file_md5_on_client, file_md5_on_server == file_md5_on_client])
    tb2.add_row([test_name, str(time_spent), file_md5_on_server, file_md5_on_client, file_md5_on_server == file_md5_on_client])
    f = open("./result.txt", 'w')
    f.write(str(tb))
    f.close()
    f = open("../result.html", 'w')
    f.write(str(tb2.get_html_string()))
    f.close()

def main(client_ip, client_username, client_password, server_ip, server_username, server_password):
    global client_ssh, server_ssh, client_scp, server_scp

    client_ssh = ssh_connect(client_ip, client_username, client_password)
    server_ssh = ssh_connect(server_ip, server_username, server_password)

    client_scp = SCPClient(client_ssh.get_transport(),socket_timeout=15.0)
    server_scp = SCPClient(server_ssh.get_transport(),socket_timeout=15.0)


    list_file = os.listdir("./")
    list_dir = []
    for i in range(0,len(list_file)):

        # 构造路径
        path = os.path.join("./", list_file[i])

        # 判断路径是否是一个文件目录或者文件
        # 如果是文件目录，继续递归

        if os.path.isdir(path):
            list_dir.append(path)


    for _dir in list_dir:
        #time.sleep(10)
        exec_command(server_ssh, "pkill python3")  
        exec_command(client_ssh, "pkill python3")  
        one_test(_dir + '/' + 'client.py', _dir + '/' + 'server.py', _dir[2:])

    

if __name__ == '__main__':
    parser = argparse.ArgumentParser('Automanager')
    parser.add_argument('--client_ip', type = str, required = True)
    parser.add_argument('--client_password', type = str, required = True)
    parser.add_argument('--client_username', type = str, required = True)
    parser.add_argument('--server_ip', type = str, required = True)
    parser.add_argument('--server_password', type = str, required = True)
    parser.add_argument('--server_username', type = str, required = True)

    args = parser.parse_args()

    main(args.client_ip, args.client_username, args.client_password, args.server_ip, args.server_username, args.server_password)
