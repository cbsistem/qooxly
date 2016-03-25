qx.Class.define("ae.plotly.controller.Project",{

    extend : qx.core.Object,
    include : [qx.locale.MTranslation],

    construct: function(){
        this._initializeCommands();

    },

    members:{

        __commands : null,


        /**
         * Initialize commands (shortcuts, ...)
         */
        _initializeCommands : function()
        {
            var commands = {};
            
            commands.newplot = new qx.ui.command.Command();
            commands.newplot.addListener("execute", function(){
            	qx.core.Init.getApplication().getChartView().plot([],{});
            }, this);
            
            commands.open = new qx.ui.command.Command();
            commands.open.addListener("execute", function(){
            	this.openPlot();
            }, this);
            
            commands.openurl = new qx.ui.command.Command();
            commands.openurl.addListener("execute", function(){
            	this.openPlotFromUrl();
            }, this);
            
            commands.saveas = new qx.ui.command.Command();
            commands.saveas.addListener("execute", function(){
            	this.savePlotAs();
            }, this);
            
            commands.option = new qx.ui.command.Command();
            commands.option.addListener("execute", function(e){
            	if(!e.getData().getValue()){
            		//activate
            		qx.core.Init.getApplication().getChartView().getSettingsUI().show();
                }else{
                	//deactivate
                	qx.core.Init.getApplication().getChartView().getSettingsUI().exclude();
                }
                //this.configure();
            }, this);

            commands.help = new qx.ui.command.Command("F1");
            commands.help.setEnabled(false);
            
            commands.help.addListener("execute", function(){window.open("https://github.com/adeliz/qxplotly/issues");}, this);

            commands.bug = new qx.ui.command.Command();
            commands.bug.addListener("execute", function(){window.open("https://github.com/adeliz/qxplotly/issues");}, this);

            commands.about = new qx.ui.command.Command();
            commands.about.addListener("execute", this.about, this);

            this.__commands = commands;
        },

        /**
         * Get the command with the given command id
         *
         * @param commandId {String} the command's command id
         * @return {qx.ui.core.Command} The command
         */
        getCommand : function(commandId) {
            return this.__commands[commandId];
        },

        openPlot : function(){
        	var win = this.win = new qx.ui.window.Window(this
					.tr("Open...")).set({
				width : 300,
				//height:400,
				showMaximize : false,
				showMinimize : false,
				showClose : true,
				contentPadding : 0
			});
			this.win.setLayout(new qx.ui.layout.VBox());

			win.addListener("resize", function() {
				this.center();
			}, win);

			var layout = new qx.ui.layout.Grid(10, 20);
			layout.setSpacing(5);

			var inputWidget = new ae.plotly.ui.UploadWidget().set({
				margin : 5
			});

			var composite = new qx.ui.container.Composite()
					.set({
						margin : 5
					});
			composite.setLayout(new qx.ui.layout.HBox().set({
				spacing : 4,
				alignX : "right"
			}));
			var cancelButton = new qx.ui.form.Button("Cancel");
			cancelButton.addListener("click", function(e) {
				this.close();
			}, win);
			var addButton = this.addButton = new qx.ui.form.Button(this.tr("Open"));
			this.addButton.addListener("click", function(e) {
				//HTML5 Version - Doesn't work with ie9
            	var charge = new FileReader();

                charge.readAsText(inputWidget.getFiles()[0]);

                var controller = this;
                charge.onloadend = function (e) {

                    var jsmodel = qx.lang.Json.parse(e.target.result);
                    controller.loadFromJson(jsmodel);
                    win.close();
                };
			},this);
			
			composite.add(addButton);
			this.win.add(inputWidget);


			
			composite.add(cancelButton);

			
			this.win.add(composite);
			this.win.show();
        },
        
        openPlotFromUrl : function(){
        	//http://www.topofusion.com/gpx.php
            var win = this.win = new qx.ui.window.Window("Open from URL...");
            win.setLayout(new qx.ui.layout.VBox());
            //win.setShowStatusbar(true);
            //win.setStatus("Status bar");
            win.setShowMinimize(false);
            win.setShowMaximize(false);
            win.setModal(true);
            win.setMinWidth(400);
            win.setMinHeight(100);
            win.addListener("resize", function () {
                this.center();
            }, win);

            this.urlWidget = new qx.ui.form.TextField().set({
                placeholder:"http://www.example.com/myfile.json"
            });
            win.add(this.urlWidget);
            var composite = new qx.ui.container.Composite().set({
                marginTop: 8
            });
            composite.setLayout(new qx.ui.layout.HBox().set({
                spacing: 4,
                alignX: "right"
            }));
            var cancelButton = new qx.ui.form.Button("Cancel");
            cancelButton.addListener("click", function (e) {
                this.close();
            }, win);
            var addButton = new qx.ui.form.Button("Open");
            addButton.addListener("click", function (e) {

                this.win.close();

                this.loadFromUrl(this.urlWidget.getValue());
                //qx.core.Init.getApplication().mainController.loadFromExternalUrl(this.urlWidget.getValue());


            }, this);
            composite.add(addButton);
            composite.add(cancelButton);
            win.add(composite);
            qx.core.Init.getApplication().getRoot().add(win);
            qx.core.Init.getApplication().getRoot().setBlockerColor("#aaa");
            qx.core.Init.getApplication().getRoot().setBlockerOpacity(0.5);
            win.open();
        },
        
        loadFromJson : function(obj){
        	qx.core.Init.getApplication().getChartView().plot(obj.data, obj.layout);
        },
        
        loadFromUrl : function(url){
        	var req = new qx.io.request.Xhr(url);
            req.addListener("success", function (e) {
            	var obj = e.getTarget().getResponse();
            	if(typeof(obj) === 'string' || obj instanceof String){
            		obj = JSON.parse(e.getTarget().getResponse());
            	} 
            	
            	this.loadFromJson(obj);
            	//var cp = encodeURIComponent(JSON.stringify(obj));
            	//var cp = JSON.stringify(obj);
        		
        		
        		/*for(var i=0;i<obj.data.length;i++){
            		
            		var src = obj.data[i].source;
            		if(src){
            			switch(src.format){
            			case "SAGD":
            				var url="http://cmhm-sig/api/v1/query?";
            				//var url=src1.url;
            				for(key in src.parameters){
            					url=url+key+"="+src.parameters[key]+"&";
            				}
            				console.log(url);
            				this.loadData(i,url);                    				
            				break;
            			}
            			console.log(src.format);
            		}
            	}*/

                
            },this);
            req.send();
        },
        
        savePlotAs : function(){
        	var win = this.win = new qx.ui.window.Window(this
					.tr("Save chart as...")).set({
				width : 300,
				//height:80,
				showMaximize : false,
				showMinimize : false,
				showClose : true,
				modal : true,
				contentPadding : 10,
				margin : 15
			});
			this.win.setLayout(new qx.ui.layout.HBox());

			win.addListener("resize", function() {
				this.center();
			}, win);

			var textfield = new qx.ui.form.TextField().set({
				placeholder : "File name"
			});
			
			var selectBox = new qx.ui.form.SelectBox().set({
				marginLeft : 5,
				marginRight : 5,
				maxWidth:70
			});
			selectBox.add(new qx.ui.form.ListItem("JSON"));
			selectBox.add(new qx.ui.form.ListItem("SVG"));
			selectBox.add(new qx.ui.form.ListItem("PNG"));
			
			
			var button = new qx.ui.form.Button(this.tr("save"))
					
			this.win.add(textfield, {
				flex : 1
			});
			
			this.win.add(selectBox);
			this.win.add(button);
			this.win.show();

			button.addListener("execute", function() {
				var model = qx.core.Init.getApplication()
						.getChartView();

				var format = selectBox.getSelection()[0].getLabel().toLowerCase();
				//console.log(qx.lang.Json.stringify(json));
				model.saveAs(format,textfield.getValue());
				win.close();
			}, this);
        },
        
        configure : function(){
            var win = this.win = new qx.ui.window.Window("Settings").set({
            	margin:0,
            	padding:0
            });
            win.setLayout(new qx.ui.layout.VBox());
            //win.setShowStatusbar(true);
            //win.setStatus("Status bar");
            win.setShowMinimize(false);
            win.setShowMaximize(false);
            //win.setModal(true);
            win.setMinWidth(400);
            win.setMinHeight(600);
            

            win.moveTo(10,120);
            //win.center()
            /*win.addListener("resize", function () {
                this.center();
            }, win);*/

            var toolbar  = qx.core.Init.getApplication().getToolBar();
            
            var pane = new qx.ui.container.Composite(new qx.ui.layout.VBox()).set({
    			//paddingTop:10,
    			decorator:"main"
    		});

    		pane.addListenerOnce("appear",function(){
        		var editor = this._ace = window.ace.edit(pane.getContentElement().getDomElement());
            	editor.getSession().setMode("ace/mode/javascript");
            	var ed = this._editor;
            		/*editor.on('change',function(){
	            		ed.getModel().getNotification().setScript(editor.getSession().getValue());
	            	});*/
	            	editor.getSession().setValue("var data = {\n"+
						"    marker:{\n"+
						"        size: 4\n"+
						"    }\n"+
						"\n}"+
						"\n"+
						"qxPlotly.restyle(data);");

            	
    		},this);

    		pane.addListener("appear",function(){
        		this._ace.resize();
    		},this);
 

            //win.add(pane,{flex:1});
            win.add(qx.core.Init.getApplication().getChartView().qxchart.getSettingsUI(),{flex:1});
            var composite = new qx.ui.container.Composite().set({
                marginTop: 8
            });
            composite.setLayout(new qx.ui.layout.HBox().set({
                spacing: 4,
                alignX: "right"
            }));
            var cancelButton = new qx.ui.form.Button("Apply");
            cancelButton.addListener("click", function (e) {
            	eval(this._ace.getSession().getValue().replace("qxPlotly","qx.core.Init.getApplication().getChartView()"));
            }, this);

            composite.add(cancelButton);
            win.add(composite);
            qx.core.Init.getApplication().getRoot().add(win);
            qx.core.Init.getApplication().getRoot().setBlockerColor("#aaa");
            qx.core.Init.getApplication().getRoot().setBlockerOpacity(0.5);
            win.open();
        },

        about : function(){
            var win = this.win = new qx.ui.window.Window(this.tr("About")).set({
                width:300,
                height:180,
                showMaximize : false,
                showMinimize : false,
                showClose : true,
                modal : true,
                contentPadding: 10,
                margin : 15
            });
            this.win.setLayout(new qx.ui.layout.VBox());

            win.addListener("resize", function(){
                this.center();
            }, win);

            /*var layout = new qx.ui.layout.VBox();
            layout.setSpacing(5);
            var container  = new qx.ui.container.Composite(layout).set({
                margin:5
            }); */
            var html = new qx.ui.embed.Html("<b>Plotly Editor</b><br>Charting Application<br>Version "+qx.core.Environment.version+"<br><a target='_blank' href='https://github.com/adeliz/qxplotly'>https://github.com/adeliz/qxplotly</a>");
            //container.add(html);
            this.win.add(html,{flex:1});
            this.win.show();
        }
    }
});