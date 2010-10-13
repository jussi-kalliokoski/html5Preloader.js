/*
html5-preloader :: EXTENSION- Rotary graphical feedback plugin.
*/

html5Preloader.prototype.rotaryGraph = {
	angle: 0,
	color: 'white',
	scale: 1.0,
	customText: ''
};
html5Preloader.prototype.drawRotary = function(ctx, w, h)
{
	ctx.save();
	ctx.translate(w/2, h/2);
	var s = Math.min(Math.floor(w/80), Math.floor(h/60)) * this.rotaryGraph.scale, drawText = 'Finished!', xi;
	if (this.active)
		drawText = 'Loading '+this.nowLoading+'... ('+Math.floor(this.getProgress()*100)+'%)';
	if (this.rotaryGraph.customText != '')
		drawText = this.rotaryGraph.customText;
	ctx.lineWidth = s;
	ctx.lineCap = 'round';
	ctx.strokeStyle = this.rotaryGraph.color;
	ctx.fillStyle = this.rotaryGraph.color;
	if (!this.active)
		ctx.globalAlpha = 0.5+0.05*Math.abs(this.rotaryGraph.angle-10);
	for (i=0; i<20; i++)
	{
		xi = (this.active) ? (20-this.rotaryGraph.angle+i) % 20 : 10;
		if (this.active) ctx.globalAlpha = (0.5+xi*0.025);
		ctx.beginPath();
		ctx.moveTo(Math.sin(-Math.PI / 10 * i)*s*5, Math.cos(-Math.PI / 10 * i)*s*5);
		ctx.lineTo(Math.sin(-Math.PI / 10 * i)*s*15, Math.cos(-Math.PI / 10 * i)*s*15);
		ctx.stroke();
	}
	ctx.globalAlpha = 1.0;
	ctx.font = s+'pt Arial';
	ctx.textAlign = 'center';
	ctx.fillText(drawText, 0, s*20, s*40);
	ctx.restore();
	this.rotaryGraph.angle = (this.rotaryGraph.angle + 1) % 20;
};
