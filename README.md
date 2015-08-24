Firebase adapter for dhtmlxGantt
=============================

Library allows using [dhtmlxGantt](http://dhtmlx.com/docs/products/dhtmlxGantt) components with [FireBase](https://firebase.com/)

Citing the Firebase site:

When data changes, apps built with Firebase update instantly across every device -- web or mobile.

Firebase-powered apps work offline. Data is synchronized instantly when your app regains connectivity.


How to use
-----------

Include dhtmlxGantt and Firebase files on the page

```html
<!-- dhtmlxGantt -->
<script src="../source/dhtmlx_gantt/sources/dhtmlxgantt.js"></script>
<link rel="stylesheet" href="../source/dhtmlx_gantt/sources/skins/dhtmlxgantt_skyblue.css">

<!-- dhtmlxGantt-Firebase adapter -->
<script type="text/javascript" src="../source/dhtmlx_gantt_firebase.js"></script>

<!-- FireBase -->
<script src="https://cdn.firebase.com/js/client/2.2.4/firebase.js"></script>
```
Create html for dhtmlxGantt

```html
    <div id="gantt_here" style="width: 100%; height: 500px;"></div>
```

Init dhtmlxGantt

```js
    gantt.init("gantt_here");
```

Create firebase connection and set this to gantt

```js
    var data = new Firebase("https://dhtmlxgantttest.firebaseio.com/"),
    //Load data from first collections.
    gantt.firebase({tasks: data.child("tasks"), links: data.child("links")});
```

Stop the data adapter

```js
    gantt.firebaseStop();
```

That is it.

License
----------

DHTMLX is published under the GPLv3 license.
Firebase adapter is published under MIT license

License:

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS	IN THE SOFTWARE.

Copyright (c) 2015 DHTMLX
```
