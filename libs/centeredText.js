(function(API){
    API.centeredText = function(text, x, y) {

        var fontSize = this.internal.getFontSize();
        var textWidth = this.getStringUnitWidth(text)*fontSize/this.internal.scaleFactor;

        x = x - textWidth/2;

        this.text(text, x, y);
        //this.rect(x, y, textWidth, 0.1, 'S');
    }
})(jsPDF.API);