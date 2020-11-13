# Chat

Chat made out of pure Javascript, HTML5, CSS and server side NodeJS. No framework used.

# Installing

Just clone, set SLL configuration and in server folder run "npm install".

# Starting

In server folder run "npm start" (server is configured to run on port 443).

# Stoping

In server folder run "npm stop" (only works if server is configured on port 443)

# Testing

In server folder run "npm test" to be able to keep up with the proccess in console.

# Generating a link for accessing the Chat page.

Access https://[YOUR_DOMAIN]/class/link

You will see a similar return as

{
    "result":"https://[YOUR_DOMAIN]/class/eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb29tIjoxNjA1MjcxMjEzNzA4LCJpYXQiOjE2MDUyNzEyMTN9.QLb3eU7pYBRbgDgcFSi8vJbZVr4ez7cShkxqcwWPhlw","message":"Link Created Successfully",
    "error":0
}

Then access the link in result value.

# Comment

/public/pod/chat/index.html was build to be appended inside a conteiner, so you can set conteiner max dimensions.