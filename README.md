# playwright-enhanced-axe-html-auditor
This is a containerized auditor that given a list of urls can leverage axe to run a enhanced axe-html-reporter. Currently the only enhancement is for any color related issues it launches a tab that give you contextually multiple passing choices (up to 25) to make a decision stakeholders should be happy with.

you will need 

run command:

npm i

What that does is pull all the node packages needed to run this

For the next set of commands you will need docker or podman already running. If using podman just replace docker with podman...

run command:
docker build -t axe-audit .

What that does is build and tags the built container as axe-audit

run command:

docker run \
  -v [pwd]/urls.txt:/app/urls.txt \
  -v [pwd]/reports:/app/reports \

What this does is allow container 
to input urls.txt and output reports

