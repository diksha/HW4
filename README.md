
# HW4

## Setup

1. Clone this repository - https://github.com/diksha/HW4
	```bash
	git clone https://github.com/diksha/HW4.git
	```

2. Run 
```docker-compose up```

This will create containers for proxy main and redis and will also start the server.

3. Run infrastructure.js 
```node infrastructure.js```

4. Spawn a new server

``` localhost:8001/spawn ```

This will spawn a new server

![HW4Part1.gif](https://github.com/diksha/HW4/blob/master/screencast/HW4Part1.gif)


##Part 2
1. Copy HW4Part2 post-commit into git hooks of App
2. Copy HW4Part2 green_post-receive to post-receive in green.git hooks
3. Copy HW4Part2 blue_post-receive to post-receive in blue.git hooks

Commit some change to App
And then push to blue or green
```git push green master```

We can see that the code is pushed to green and a docker is spawned.

![HW4Part2.gif](https://github.com/diksha/HW4/blob/master/screencast/HW4Part2.gif)


##Part 3

1. Clone HW4Part3

Do the following steps

Create a container that runs a command that outputs to a file.

```docker build -t container1 .```

Use socat to map file access to read file container and expose over port 9001 (hint can use SYSTEM + cat).
	
```docker run -td --name first_container container1```

Creates 1st container

```docker build -t container2 .```
```docker run -td --link first_container1:input --name second_container1 container2```

Creates 2nd container and links it

```docker exec -it second_container1 bash```

Use a linked container that access that file over network. The linked container can just use a command such as curl to access data from other container.


```curl input:9001```

![HW4Part3.gif](https://github.com/diksha/HW4/blob/master/screencast/HW4Part3.gif)
