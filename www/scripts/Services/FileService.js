'use strict';

angular.module('slingshot')

.service("fileService", ['$timeout', '$cordovaDialogs', 'localStorageService', 'sqlService', 'toastService', '$state', '$rootScope', function($timeout, $cordovaDialogs, localStorageService, sqlService, toastService, $state, $rootScope) {
    var fileService = this;

    var MAX_FILE_SIZE = 1024 * 1024,
        MAX_GRANT_SIZE = 1024 * 1024 * 280;

    var contentType = 'image/png',
        b64Data, viewerTop, viewerWidth, viewerHeight, images = [], viewerLeft;

    fileService.removeFiles = function(dir, callback) {
        removeDirectory();

        function removeDirectory() {
            window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, onDirectorySuccessToRemove, onfail);
        };

        function onDirectorySuccessToRemove(fs) {
            fs.root.getDirectory(dir, null, gotDirectorySuccessToRemove, onfail);
        };

        function gotDirectorySuccessToRemove(getDirectory) {

            getDirectory.removeRecursively(successRemove, onfail);
        };

        function successRemove(entry) {
            callback({
                'Success': true
            });
        };

        function onfail(error) {
            callback({
                'Success': false
            });
        }
    };

    fileService.writeFiles = function(dir, files, callback) {
        var count = 0;
        writeDirectory();

        function writeDirectory() {
            window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, onFileSystemSuccessToUpdate, fail);
        };

        function onFileSystemSuccessToUpdate(fs) {

            fs.root.getDirectory("images", {
                create: true,
            });
            fs.root.getDirectory(dir, {
                create: true,
                exclusive: false
            }, gotDirEntryToUpdate, fail);
        };

        function gotDirEntryToUpdate(getDirectory) {
            var d = new Date();
            var n = d.getTime();
            var newFileName = n + ".jpg";

            getDirectory.getFile(newFileName, {
                create: true,
                exclusive: false
            }, gotFileEntryToUpdate, fail);
        };

        function gotFileEntryToUpdate(fileEntry) {
            fileEntry.createWriter(gotFileUpdateWriter, fail);
        };

        function gotFileUpdateWriter(writer) {
            writer.onwriteend = function(evt) {
                if (count < files.length - 1) {
                    count = count + 1;
                    writeDirectory();
                } else {
                    callback({
                        'Success': true
                    });
                }
            };
            writer.write(files[count].Data);
        };

        function fail(error) {
            callback({
                'Success': false
            });
        };

    };

    fileService.readFiles = function(dir, callback) {
        var counter = 0,
            fileEntry,
            imageList = [];
            images = [];
        readDirectory();

        function readDirectory() {
            window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, onDirectorySuccessToRead, fail);
        };

        function onDirectorySuccessToRead(fs) {
            fs.root.getDirectory(dir, null, gotDirectorySuccessToRead, fail);
        };

        function gotDirectorySuccessToRead(getDirectory) {

            var directoryReader = getDirectory.createReader();
            directoryReader.readEntries(success, fail);
        };

        function success(entries) {
            // fileCount = entries.length;
            for (var i = 0; i < entries.length; i++) {
                imageList.push(entries[i]);
            }
            fileEntry = imageList[counter];
            gotFileEntryToRead(fileEntry);

        };

        function gotFileEntryToRead(fileEntry) {
            fileEntry.file(gotFile, fail);
        };

        function gotFile(file) {
            readAsText(file);
        };

        function readAsText(file) {

            var reader = new FileReader();

            reader.onloadend = function(evt) {
                b64Data = evt.target.result;
                getHeightWidth(b64Data);
                var imageData = {
                    Data: evt.target.result
                };

                $rootScope.images.push(imageData);

                if (counter < imageList.length - 1) {
                    counter = counter + 1;
                    fileEntry = imageList[counter];
                    gotFileEntryToRead(fileEntry);
                } else {
                    callback({
                        'Success': true,
                        'Images': images
                    });
                }
            };
            reader.readAsText(file);
        };

        function fail(error) {
            console.log(error);
        };
    };


    function b64toBlob(b64Data, contentType, sliceSize) {
        contentType = contentType || '';
        sliceSize = sliceSize || 512;

        var byteCharacters = atob(b64Data);
        var byteArrays = [];

        for (var offset = 0; offset < byteCharacters.length; offset += sliceSize) {
            var slice = byteCharacters.slice(offset, offset + sliceSize);

            var byteNumbers = new Array(slice.length);
            for (var i = 0; i < slice.length; i++) {
                byteNumbers[i] = slice.charCodeAt(i);
            }

            var byteArray = new Uint8Array(byteNumbers);

            byteArrays.push(byteArray);
        }

        var blob = new Blob(byteArrays, { type: contentType });
        return blob;
    };

       function getHeightWidth(b64Data) {
                var img = new Image();
                 img.src = "data:image/png;base64," + b64Data;
                 img.onload = function() {
                     console.log(this.width);


                     var width = this.width;
                     var height = this.height;
                     var slide = document.getElementsByClassName('slider');
                     var aspectRation = width / height;
                     var parentWidth = slide[0].offsetWidth;
                     var parentHeight = slide[0].offsetHeight;
                     if (aspectRation > 1) {

                         viewerWidth = parentWidth;
                         viewerHeight = viewerWidth / aspectRation;
                         viewerTop = (parentHeight - viewerHeight) / 2;
                         viewerLeft = 0;
                     } else {

                         viewerHeight = parentHeight;
                         viewerWidth = viewerHeight * aspectRation;
                         viewerLeft = (parentWidth - viewerWidth) / 2;
                         viewerTop = 0;
                     }

                     var blob = b64toBlob(b64Data, contentType);
                     var blobUrl = URL.createObjectURL(blob);
                     images.push({ Data: blobUrl, Width: viewerWidth, Height: viewerHeight, Top: viewerTop });
                 }
             };
}]);
