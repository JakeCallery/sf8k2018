/**
 * Created with JetBrains PhpStorm.
 * User: Jake
 */


	var BlobUtils = {};

	BlobUtils.binaryStringToBlob = function($bs, $options){
		//TODO: maybe offload this to a webworker?
		var blobData = new Uint8Array($bs.length);

		for(var i = 0; i < $bs.length; i++) {
			blobData[i] = $bs.charCodeAt(i);
		}

		return new Blob([blobData.buffer], $options);
	};

    BlobUtils.dataUrlToBlob = function($dataUrl, $options){
        var imageData = atob($dataUrl.split(',')[1]);
        var blobData = new Uint8Array(imageData.length);

        for (var i = 0; i < imageData.length; i++) {
            blobData[i] = imageData.charCodeAt(i);
        }

		return new Blob([blobData.buffer], $options);

    };

	//Return constructor
	export default BlobUtils;

