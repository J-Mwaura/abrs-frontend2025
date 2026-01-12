[Getting started](#getting-started)

[Command for creating react app](#create-app)

[Clone this app](#clone-this-app)

[Run the app](#run-the-app)

[UI developed using Material UI](#material-ui)

[Create a github account](#create-a-github-account)

[Push commits to your repo](#push-commits-to-your-repo)

[Serving app on public domain](#serving-app-on-public-domain)

[Enhancement](#enhancement)
[Version](#version)
[Changing icon](#changing-icon)


# Getting started

Pay attention to the format of this README file.

Have the following installed on your computer

1. Visual studio IDE - https://code.visualstudio.com/download
2. Node js - https://nodejs.org/en/download/
3. Git tools - https://gitforwindows.org/

# Create app

ng new skmsys --inline-style=true --inline-template=true

then change component to standalone: true

//--////

# Clone this app

Use 'git clone $repo' to clone this app.

Install node modules 'npm install'

# Run the app

Open terminal on VS or use a command line interface like gitbash or Poweshell and type this command 'npm start'. The app will open on http://localhost:3000

# Material UI
 
Enhance app appearance using Material UI

https://mui.com/material-ui/getting-started/installation

Install the following

1. npm install @mui/icons-material
2. npm install @emotion/react
3. npm install @emotion/styled

# Create a github account

Create a github account here https://github.com

# Push commits to your repo

Create a repository and follow the instructions that will be displayed.

# Serving app on public domain

To host your app create an account on netlify https://app.netlify.com.

The easiest way is to use your github accout.

On netlify go to 'Add new site' and click on 'Import an existing project'

Import your project from a Git repository.

If all the above steps have been met, the app should open on the browser.

# Enhancement

Added component ResponsiveLayoutComponent service to detect media query matches, 
allowing you to adapt your application's behavior based on screen size or other media features.
Not sure whether it works 

The area page have the hamburger button that will appear in all other pages in that folder


npm run build
npm start

# Version

Change version in version.ts
"version": "1.1.0",

# check deployed files on Heroku
heroku run bash --app gwcw-revenue-2025

# Changing icon
https://www.youtube.com/watch?v=2Ce09by4qFE
https://www.flaticon.com/

# Generating apk

ionic build
ionic cap copy
ionic cap sync
ionic cap open android

View on android studio

ionic cap open android
