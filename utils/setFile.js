function randomString(length)
{
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";
 
    for( var i=0; i < length; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));
 
    return text;
}
function getBase64Image(imgData) {
    return imgData.replace(/^data:image\/(png|jpeg|jpg);base64,/, "");
}
module.exports ={
    randomString, 
    getBase64Image

};