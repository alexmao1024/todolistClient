## Notice

The code in the default branch has major problems with the design of the mercue, and version 2 optimizes them.

# TodolistClient

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 13.2.3.
They realizes the basic function of a to-do list.

## Login and Register

This project performs regular expression validation on login and registration forms.And solve the security problem through the token.The token will be stored in the local storage of the browser. The function of automatic login and automatic logout after expiration is realized.

## Basic function
You can create and manipulate your main list,and you can also create specific tasks under each list branch.
A list has only name, and you can create multiple lists at a time. A task has a name, a specific content, and a start to end time. Both have completed and incomplete states. After finished them, you can mark them as complete by ticking.

## Innovative design

This project uses mercue technology for real-time updates.We have a workspace that allows multiple users to work together to operate multiple lists or tasks.
You can add your existing lists to the workspaces you already participated in. Alternatively, you can also create new lists or tasks directly in them.
All users in the same workspace can perform arbitrary operations on the lists or tasks.The owner of the workspace can invite any registered user, or remove participants.For all workspace-related operations, participants in that workspace are subscribed to their changes in real-time.

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

## Background implementation

The background of this project uses the symfony framework, which is implemented in php. It can be viewed in my repo. Of course, you can also implement the background code yourself.
