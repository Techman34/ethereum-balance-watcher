FROM ubuntu

COPY ./pkg/index-linux /home/app

ENTRYPOINT /home/app
