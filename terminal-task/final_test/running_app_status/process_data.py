data = []
with open('./apps_list.txt') as f:
    data = f.readline()

data = data.replace('[', '').replace(']', '').split(', ')
for i in range(len(data)):
    data[i] = data[i].replace('\'', '').replace('\"', '').strip()

with open('./apps_list.txt', 'w') as f:
    for i in range(len(data)):
        f.write(data[i] + '\n')