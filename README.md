CRAMS Frontend Installation
===========================

Prerequisites
-------------
- Node.js
- NPM

Install Node.js® and NPM on Windows
==================================

Step 1: Download Node.js Installer
----------------------------------

In a web browser, navigate to https://nodejs.org/en/download/. Click the Windows Installer button to download the latest default version. 
The Node.js installer includes the NPM package manager.

Step 2: Install Node.js and NPM from Browser
----------------------------------------------
1. Once the installer finishes downloading, launch it. Open the downloads link in your browser and click the file. Or, browse to the location where you have saved the file and double-click it to launch.

2. The system will ask if you want to run the software – click Run.

3. You will be welcomed to the Node.js Setup Wizard – click Next.

4. On the next screen, review the license agreement. Click Next if you agree to the terms and install the software.

5. The installer will prompt you for the installation location. Leave the default location, unless you have a specific need to install it somewhere else – then click Next.

6. The wizard will let you select components to include or remove from the installation. Again, unless you have a specific need, accept the defaults by clicking Next.

7. Finally, click the Install button to run the installer. When it finishes, click Finish.

Step 3: Verify Installation
----------------------------
Open a command prompt (or PowerShell), and enter the following::

~] node –v

The system should display the Node.js version installed on your system. You can do the same for NPM::

~] npm –v

Install Node.js® and NPM on Ubuntu
=================================

To install Node.js and npm, open a terminal and type the following command
::

~] sudo apt-get install nodejs npm


* Note: some nodejs packages expect the `node` command to be available. Some deb packages of nodejs include this symlink, some do not if not:
On Ubuntu you can install the nodejs-legacy package to fix this::

~] sudo apt-get install nodejs-legacy

Now we should have both the node and npm commands working
::

~] node -v
~] npm -v


install grunt-cli globally
--------------------------
::

~] npm install -g grunt-cli 


Installing Node.js® and NPM on Mac
==================================

Installing Node.js and NPM is pretty straightforward using Homebrew. Homebrew handles downloading, unpacking and installing Node and NPM on your system. 
The whole process (after you have Homebrew installed) should only take you a few minutes.

Installation Steps
-------------------

Open the Terminal app and type brew update. This updates Homebrew with a list of the latest version of Node
::

~] brew install node.


Sit back and wait. Homebrew has to download some files and install them. But that’s it.

Verify Node.js and NPM
-----------------------
::

~] node -v
~] npm -v


Setup CRAMS Frontend
=====================
Checkout the CRAMS Frontend source from https://github.com/CRAMS-Dashboard/crams-frontend
::

~] git clone https://github.com/CRAMS-Dashboard/crams-frontend.git

Install the required node modules. Under the project root directory
--------------------------------------------------------------------
::

~] cd crams-frontend
~] npm install


There are ``local``, ``dev``, ``demo``, ``staging``, ``qat``, ``prod`` settings in the ``Gruntfile.js``. Modify the ``apiEndpoint`` to fit the right crams api backend url.

To run the project locally
-------------------------
::

~] grunt runlocal

To run the project in dev
--------------------------
::
 
~] grunt rundev

To run the project in demo
--------------------------
::
 
~] grunt rundemo

To run the project in staging
--------------------------
::
 
~] grunt runstaging

To run the project in qat
-------------------------- 
::
 
~] grunt runqat 

To run the project in prod
--------------------------
::
 
~] grunt runprod

To run test
-------------------------
::
 
~] grunt utest
 