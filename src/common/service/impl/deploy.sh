#!/bin/bash
userid=$1
pw=$2
h5zip=$3
ip=$4
port=$5
topath=$6
expect -c "
spawn rsync -raqpPL --delete $h5zip  $userid@$ip:$topath
expect {
        \"*assword\" {set timeout 300;send \"$pw\r\";}
        \"yes/no\" {send \"yes\r\"; exp_continue;}
}
expect eof"
