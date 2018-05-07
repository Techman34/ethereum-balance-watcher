FROM ubuntu

COPY ./pkg/index /home/app

ENTRYPOINT /home/app
