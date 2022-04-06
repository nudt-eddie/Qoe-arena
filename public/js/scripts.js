jQuery(document).ready(function($){
    
    // create a FormData object which will be sent as the data payload in the
    // AJAX request
    var formData = new FormData();

    $('#file-uploader').on('change', function(){

        var files = $(this).get(0).files;
        
        if (files.length > 0){
            // One or more files selected, process the file upload

            

            // loop through all the selected files
            for (var i = 0; i < files.length; i++) {
                var file = files[i];

                // // add the files to formData object for the data payload
                formData.append('photos', file, file.name);
            }

            console.log( formData.getAll('photos'));

        }

    });

    $('form').on('submit', function (e){
        e.preventDefault();

        $.ajax({
            url: '/upload1',
            type: 'POST',
            data: formData,
            processData: false,
            contentType: false,
            
            xhr: function() {
                // create an XMLHttpRequest
                var xhr = new XMLHttpRequest();

                // listen to the 'progress' event
                xhr.upload.addEventListener('progress', function(evt) {

                    if (evt.lengthComputable) {
                        // calculate the percentage of upload completed
                        var percentComplete = evt.loaded / evt.total;
                        percentComplete = parseInt(percentComplete * 100);

                        // update the Bootstrap progress bar with the new percentage
                        $('.status').text(percentComplete + '%');
                        $('.progress-bar .inner').width(percentComplete + '%');

                        // once the upload reaches 100%, set the progress bar text to done
                        if (percentComplete === 100) {
                            $('.status').html('Done');
                        }

                    }

                }, false);

                return xhr;
            }
        }).then(function(data){
            console.log('upload successful!\n',data);
        })
    });
});