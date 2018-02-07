# instagram_clone

### Criar volumes
docker volume create mongodb
docker volume create mongodbcfg

### Run container
docker container run --detach --name mongodb -p 27017:27017 -v mongodbdata:/data/db -v mongodbcfg:/data/configdb mongo:latest

### Inspecionar configuração do container iniciado
docker inspect mongodb

### Inspecionando log do container
docker container logs mongodb

### Inspecionando processo no container
docker container top mongodb

### Acessando o container
docker exec -it mongodb /bin/sh