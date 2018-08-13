# Restaurant Reviews: A Mobile Web Specialist Certification Project


It's a mobile-ready web application in which the criteria of **responsive design**, **accessibility**, and **offline-first** techniques are applied to a very high level while achieving a performance score of more than 95% (according to [Lighthouse](https://developers.google.com/web/tools/lighthouse/)) 


This project qualified me to become certified Mobile Web Specialist from [Udacity In Collaboration With Google](https://in.udacity.com/course/mobile-web-specialist-nanodegree--nd024)


## Project description:

- This web application consists of two pages; the home page to list the restaurants filtered by a selected neighborhood and  cuisines, the second page shows the details and reviews of the selected restaurant

- Use [Google Map API](https://developers.google.com/maps/documentation/javascript/get-api-key) to locate the restaurants easily

- Users can submit their own reviews for a restaurant

- Users are able to mark a restaurant as a favorite

- Users are able to toggle listing only favorites or all restaurants 

- Lighthouse registered **more than 90%** score for each of _Performance_, _Accessibility_,and _Progressive Web App_ audits
## Project Features:

- Plain CSS and responsive images to achieve site responsiveness; the site UI is compatible with a range of display sizes, and the application elements are visible and usable in all viewports

- Accessible images,  appropriate focus to allow easy navigation of the site, and semantically defined site elements

- Offline use; IndexedDB and Service worker APIs and caches are used to store the AppShell and the contents for offline use

- Navigator Online/Offline helps Users to be able to add a review to a restaurant while offline and the review is sent to the server when connectivity is re-established

## How to test the project:

- Restaurant Reviews web application needs a backend server to deal with the restaurants data. Download and run it from [here](https://github.com/aelbasioni/mws-restaurant-server)

- Download **Restaurant Review** package, then open the project using Visual studio IDE, or using any editor **but keep in mind that this project has to run through local HTTP server (localhost)**

- Check out the project folder and run `npm install`

- Then run `gulp` to run the required tasks

- Note: the **dist** folder contains the active version of the project 

### How to run local HTTP server

Many options are there to **pick up one** to be used to run local HTTP server:

#### 1- Visual studio IDE:

If you use Visual studio IDE, then it already has IIS Express,so, no need to do any thing, just press `run`.

#### 2- Code Editors:

If you use Code Editors, then most of them have downloadable extensions for live servers. Install and click run button of any of them (i.e. [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) for Visual Code)

#### 3- Web Server for Chrome:

Open [Web Server for Chrome](https://chrome.google.com/webstore/detail/web-server-for-chrome/ofhbbkphhbklhfoeikjpcbhemlocgigb?hl=en), then enter the project folder. Make sure the _Started_ button is on, then copy the shown URL and paste it in the browser, and start exploring the web application

#### 4- Python:

- In the <u>project folder</u>, open a terminal 
- Check the version of Python you have: `python -V`
- If you have Python 2.x, spin up the server with `python -m SimpleHTTPServer 8000` (or some other port, if port 8000 is already in use.)
- For Python 3.x, you can use `python3 -m http.server 8000`
- If you don't have Python installed, navigate to [Python's website](https://www.python.org/) to download and install the software.
- With your server running, visit the site: http://localhost:8000 and explore the web application
    