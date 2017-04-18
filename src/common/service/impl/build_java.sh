#!/bin/bash
projectPath=$1
task=$2
cd $projectPath
echo '开始构建'
$2
