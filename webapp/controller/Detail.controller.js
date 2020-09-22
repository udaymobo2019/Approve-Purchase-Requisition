var sText;
sap.ui.define([
	"./BaseController",
		"sap/m/MessageBox",
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/routing/History",
	"sap/ui/model/odata/ODataModel",
	"sap/ui/core/Fragment",
	"../model/formatter",
	"sap/m/library",
	"./utilities",
	"sap/m/Dialog",
	"sap/m/Text",
	"sap/m/TextArea",
	"sap/ui/layout/HorizontalLayout",
	"sap/ui/layout/VerticalLayout",
	"sap/ui/unified/DateRange",
	"sap/m/Button",
	"sap/m/Label"
], function (BaseController, Controller, utilities, JSONModel, ODataModel, Dialog, formatter, History, MessageBox,
	Fragment, Text, TextArea, HorizontalLayout, VerticalLayout, DateRange, Button, Label) {
	"use strict";

	// shortcut for sap.m.URLHelper
	// var URLHelper = mobileLibrary.URLHelper;

	return BaseController.extend("app.prapprovalgrunt.controller.Detail", {

		formatter: formatter,

		/* =========================================================== */
		/* lifecycle methods                                           */
		/* =========================================================== */

		onInit : function () {
			
			this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			this.oRouter.attachRouteMatched(this.handleRouteMatched, this);
			// this.valueHelp = sap.ui.xmlfragment("Dialogfragment","com.sap.build.ba293bd41-us_1.prApprovals.Fragments.Dialog",this);
			// this.getView().addDependent(this.valueHelp);
			/*Calling the Fragment for the Signature Dialog Box for the Approval*/
			this.sign_frag = sap.ui.xmlfragment("signaturefragment", "app.prapprovalgrunt.Fragments.signature", this);
			this.getView().addDependent(this.sign_frag);

			sap.ui.core.Fragment.byId("signaturefragment", "html").setContent(
				"<canvas id='signature-pad' width='1000px' height='700px' class='signature-pad'></canvas>");

			this.msg = sap.ui.xmlfragment("messagefragment", "app.prapprovalgrunt.Fragments.message", this);
			this.getView().addDependent(this.msg); /*Calling the Fragment for the Message Dialog after Posting*/
			this.getOwnerComponent().getModel("oGlobalModel").setProperty("/tableshow", false);

		},
		_onCloseButtonPress: function () {
			this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			this.oRouter.navTo("master");
		},

		handleRouteMatched: function (oEvent) {
			// alert("ok");
			this.logid = this.getView().getModel("oGlobalModel").getProperty("/username");
			console.log("this.logid", this.logid);
			this.tabArr = [];
			this.tab1 = this.getView().byId("table"); ////Getting the Id for the table
			var that = this;
			that.Prnumber = this.getView().getModel("oGlobalModel").getProperty("/doc");
			console.log(that.Prnumber);

			var oFilter = [new sap.ui.model.Filter("PRNumber", sap.ui.model.FilterOperator.EQ, this.Prnumber)];

			var sPath = "/CreateHeaderSet";
			var oModel = new sap.ui.model.odata.ODataModel('/sap/opu/odata/sap/ZMM_PR_APPROVAL_SRV/', true);
			oModel.read(sPath, {

				urlParameters: {
					"$expand": "Header2Item" //Multiple expand odata
				},
				filters: oFilter,
				success: function (oData, oResponse) {
					that.getView().byId("objh").setObjectTitle(oData.results[0].PRNumber);
					that.getView().byId("dtype").setValue(oData.results[0].DocumentType + " " + oData.results[0].DocumentDesc);
					that.getView().byId("header").setValue(oData.results[0].HeaderText);
					console.log(oData.results[0].SupervisorText);
					that.supervisorcmt = oData.results[0].SupervisorText;
					that.manager = oData.results[0].ManagerText;
					that.director = oData.results[0].DirectorText;
					console.log(that.supervisorcmt);
					console.log(that.manager);
					console.log(that.director);
					that.getView().byId("plnt").setValue(oData.results[0].Header2Item.results[0].Plant);
					that.getView().byId("purorg").setValue(oData.results[0].Header2Item.results[0].PO);
					that.getView().byId("purgrp").setValue(oData.results[0].Header2Item.results[0].PurchasingGroup);
					that.getView().byId("vend").setValue(oData.results[0].Header2Item.results[0].Vendor);
					that.relesta = oData.results[0].Header2Item.results[0].ReleaseStatus;
					that.getView().getModel("oGlobalModel").setProperty("/Release_status", that.relesta);
					that.show();

					that.ReleaseCodeList();

					if (that.relesta === "" && that.logid === "SUPERVISOR1") {

						that.getView().byId("reles").setVisible(true);
						that.getView().byId("sup_reject_dir").setVisible(true);
						that.getView().byId("rejet").setVisible(false);

					} else if (that.relesta === "" && that.logid === "MANAGER1") {

						that.getView().byId("reles").setVisible(false);
						that.getView().byId("rejet").setVisible(false);
						that.getView().byId("sup_reject_dir").setVisible(false);

					} else if (that.relesta === "" && that.logid === "DIRECTOR1") {

						that.getView().byId("reles").setVisible(false);
						that.getView().byId("rejet").setVisible(false);
						that.getView().byId("sup_reject_dir").setVisible(false);

					} else if (that.relesta === "X" && that.logid === "SUPERVISOR1") {

						that.getView().byId("reles").setVisible(false);
						that.getView().byId("sup_reject_dir").setVisible(false);
						that.getView().byId("rejet").setVisible(true);

					} else if (that.relesta === "X" && that.logid === "MANAGER1") {

						that.getView().byId("reles").setVisible(true);
						that.getView().byId("rejet").setVisible(false);
						that.getView().byId("sup_reject_dir").setVisible(true);

					} else if (that.relesta === "X" && that.logid === "DIRECTOR1") {

						that.getView().byId("reles").setVisible(false);
						that.getView().byId("rejet").setVisible(false);
						that.getView().byId("sup_reject_dir").setVisible(false);

					} else if (that.relesta === "XX" && that.logid === "SUPERVISOR1") {

						that.getView().byId("reles").setVisible(false);
						that.getView().byId("rejet").setVisible(false);
						that.getView().byId("sup_reject_dir").setVisible(false);

					} else if (that.relesta === "XX" && that.logid === "MANAGER1") {

						that.getView().byId("reles").setVisible(false);
						that.getView().byId("rejet").setVisible(true);
						that.getView().byId("sup_reject_dir").setVisible(false);

					} else if (that.relesta === "XX" && that.logid === "DIRECTOR1") {

						that.getView().byId("reles").setVisible(true);
						that.getView().byId("rejet").setVisible(false);
						that.getView().byId("sup_reject_dir").setVisible(true);

					} else if (that.relesta === "XXX" && that.logid === "SUPERVISOR1") {

						that.getView().byId("reles").setVisible(false);
						that.getView().byId("rejet").setVisible(false);
						that.getView().byId("sup_reject_dir").setVisible(false);

					} else if (that.relesta === "XXX" && that.logid === "MANAGER1") {

						that.getView().byId("reles").setVisible(false);
						that.getView().byId("rejet").setVisible(false);
						that.getView().byId("sup_reject_dir").setVisible(false);

					} else if (that.relesta === "XXX" && that.logid === "DIRECTOR1") {

						that.getView().byId("reles").setVisible(false);
						that.getView().byId("rejet").setVisible(true);
						that.getView().byId("sup_reject_dir").setVisible(false);

					} else {

					}

					/*Table Bind*/

					that.tabArr = oData.results[0].Header2Item.results;
					//	console.log("tabind", that.tabArr);

					var oModl1 = new sap.ui.model.json.JSONModel();
					oModl1.setData({ // Set the data to the model using the JSON object defined already  
						arr42: that.tabArr

					});

					that.tab1.setModel(oModl1);
					var titems1 = new sap.m.ColumnListItem({
						cells: [new sap.m.Input({
								value:'{ItemNumber}' ,			//'{ItemNumber}'.replace(/^0+/, '')
								editable: false,
								width: "auto"

							}),
							new sap.m.Input({
								// title: "{Material}",
								value: "{Material}-{Description}",
								width: "auto",
								editable: false

							}),

							new sap.m.Input({
								value: "{Quantity}",
								visible: true,
								width: "auto",
								// change: that.qtychange.bind(that), //[that.qtychange, that],
								editable: false

							}),
							new sap.m.Input({
								value: "{UoM}",
								editable: false,
								width: "auto"
							}),
							new sap.m.Input({
								value: "{Price}",
								visible: true,
								width: "auto",
								editable: false
							}),
							new sap.m.Input({
								value: "{TotalValue}",
								visible: true,
								width: "auto",
								editable: false
							}),

							new sap.m.Input({
								value: "{Plant}",
								visible: false
							}),
							new sap.m.Input({
								value: "{Vendor}",
								visible: false
							}),
							new sap.m.Input({
								value: "{PO}",
								visible: false
							}),
							new sap.m.Input({
								value: "{PurchasingGroup}",
								visible: false
							}),
							new sap.m.Input({
								value: "{ReleaseStatus}",
								visible: false
							})

						]
					});

					that.tab1.bindItems("/arr42", titems1); //Binding of Item Table

				}

			});

		},

		qtychange: function (oEvent) {

			var oTable = this.byId("table");

			//	var sum = 0;

			var count = oTable.getItems().length;
			for (var i = 0; i < count; i++) {

				var qty = oTable.getItems()[i].getCells()[2].getValue();

				var item_price = oTable.getItems()[i].getCells()[4].getText();

				var mult = qty * item_price;

				//sum = sum + mult;

				mult = mult.toFixed(2);
				// sum = sum.toFixed(2);

				oTable.getItems()[i].getCells()[5].setText(mult);
				oTable.getItems()[i].getCells()[2].setValue(qty);

			}

		},

		ReleaseCodeList: function () {

			var arrL = [];
			var spath = "/ReleaseStrategySet";
			var oModel = new sap.ui.model.odata.ODataModel('/sap/opu/odata/sap/zpm_f4_srv', true);
			oModel.read(spath, {
				success: function (oData, oResponse) {

					var count = oData.results.length;
					for (var i = 0; i < count; i++) {

						var name = oData.results[i].OrganizationalManagement; ///// Release Name
						var desc = oData.results[i].ReleaseCodedes; ///////Release Desc
						var Release_status = this.getView().getModel("oGlobalModel").getProperty("/Release_status"); // getting Release_status

						var logid = this.logid;
						var stat;
						var cmt;

						if (Release_status === "XXX" && logid === "SUPERVISOR1") {

							if (i === 0) {
								stat = "Released";
								cmt = this.supervisorcmt;
							} else if (i === 1) {
								stat = "Released";
								cmt = this.manager;
							} else if (i === 2) {
								stat = "Released";
								cmt = this.director;
							}
						} else if (Release_status === "XXX" && logid === "MANAGER1") {

							if (i === 0) {
								stat = "Released";
								cmt = this.supervisorcmt;
							} else if (i === 1) {
								stat = "Released";
								cmt = this.manager;
							} else if (i === 2) {
								stat = "Released";
								cmt = this.director;
							}
						} else if (Release_status === "XXX" && logid === "DIRECTOR1") {

							if (i === 0) {
								stat = "Released";
								cmt = this.supervisorcmt;
							} else if (i === 1) {
								stat = "Released";
								cmt = this.manager;
							} else if (i === 2) {
								stat = "Released";
								cmt = this.director;
							}
						} else if (Release_status === "" && logid === "SUPERVISOR1") {
							if (i === 0) {
								stat = "Open";
								cmt = this.supervisorcmt;
							} else if (i === 1) {
								stat = "Open";
								cmt = this.manager;
							} else if (i === 2) {
								stat = "Open";
								cmt = this.director;
							}
						} else if (Release_status === "" && logid === "MANAGER1") {
							if (i === 0) {
								stat = "Open";
								cmt = this.supervisorcmt;
							} else if (i === 1) {
								stat = "Open";
								cmt = this.manager;
							} else if (i === 2) {
								stat = "Open";
								cmt = this.director;
							}
						} else if (Release_status === "" && logid === "DIRECTOR1") {
							if (i === 0) {
								stat = "Open";
								cmt = this.supervisorcmt;
							} else if (i === 1) {
								stat = "Open";
								cmt = this.manager;
							} else if (i === 2) {
								stat = "Open";
								cmt = this.director;
							}
						} else if (Release_status === "XX" && logid === "SUPERVISOR1") {

							if (i === 0) {
								stat = "Released";
								cmt = this.supervisorcmt;
							} else if (i === 1) {
								stat = "Released";
								cmt = this.manager;
							} else if (i === 2) {
								stat = "Open";
								cmt = this.director;
							}

						} else if (Release_status === "XX" && logid === "MANAGER1") {

							if (i === 0) {
								stat = "Released";
								cmt = this.supervisorcmt;
							} else if (i === 1) {
								stat = "Released";
								cmt = this.manager;
							} else if (i === 2) {
								stat = "Open";
								cmt = this.director;
							}

						} else if (Release_status === "XX" && logid === "DIRECTOR1") {

							if (i === 0) {
								stat = "Released";
								cmt = this.supervisorcmt;
							} else if (i === 1) {
								stat = "Released";
								cmt = this.manager;
							} else if (i === 2) {
								stat = "Open";
								cmt = this.director;
							}

						} else if (Release_status === "X" && logid === "SUPERVISOR1") {

							if (i === 0) {
								stat = "Released";
								cmt = this.supervisorcmt;
							} else if (i === 1) {
								stat = "Open";
								cmt = this.manager;
							} else if (i === 2) {
								stat = "Open";
								cmt = this.director;
							}

						} else if (Release_status === "X" && logid === "MANAGER1") {

							if (i === 0) {
								stat = "Released";
								cmt = this.supervisorcmt;
							} else if (i === 1) {
								stat = "Open";
								cmt = this.manager;
							} else if (i === 2) {
								stat = "Open";
								cmt = this.director;
							}

						} else if (Release_status === "X" && logid === "DIRECTOR1") {

							if (i === 0) {
								stat = "Released";
								cmt = this.supervisorcmt;
							} else if (i === 1) {
								stat = "Open";
								cmt = this.manager;
							} else if (i === 2) {
								stat = "Open";
								cmt = this.director;
							}

						}

						var obj = {

							OrganizationalManagement: name, //// Release Name
							ReleaseCodedes: desc, /////Release Desc
							ReleaseStatus: stat, ////Release Status1
							comment: cmt
						};
						console.log(obj);
						arrL.push(obj);
						console.log(arrL);

						var newArray = arrL.filter((elem, i, arr) => {
							if (arr.indexOf(elem) === i) {
								return elem
							}
						})

						console.log(newArray);
						this.getView().getModel("oGlobalModel").setProperty("/ReleaseStatus", newArray);

					}
				}.bind(this)
			});

		},

		/* Rejecting the PR number without approving*/
		reject_pr: function () {
			var oCont = this;

			var dialog = new sap.m.Dialog({
				title: 'Confirmation',
				type: 'Message',
				content: [
					new sap.ui.layout.HorizontalLayout({
						content: [
							new sap.ui.layout.VerticalLayout({
								width: "100%",
								height: "100%",
								content: [
									new sap.m.Label({
										text: 'Are you sure you want to Reject Purchase Requisition?',
										text1: " ",
										labelFor: 'submitDialogTextarea'
									}),
								]
							})
						]
					}),

					new sap.m.TextArea('submitDialogTextarea', {

						liveChange: function (oEvent) {
							oCont.sText = oEvent.getParameter('value');
							var parent = oEvent.getSource().getParent();
							//alert(sText);
							parent.getBeginButton().setEnabled(sText);
						},
						maxLength: 50,
						width: '100%',
						placeholder: 'Add note'
					})
					//	this.getView().getModel("oGlobalModel").setProperty("/textarea",sText); 
				],
				beginButton: new sap.m.Button({
					text: 'Yes',
					enabled: true,
					press: function () {
						oCont.sText = sap.ui.getCore().byId('submitDialogTextarea').getValue();
						oCont.reject_pr1();
						dialog.close();

					}
				}),
				endButton: new sap.m.Button({
					text: 'No',
					press: function () {
						dialog.close();
					}
				}),
				afterClose: function () {
					dialog.destroy();
				}
			});

			dialog.open();

		},

		reject_pr1: function () {

			var prnum2 = this.getView().byId("objh").getObjectTitle();
			//	alert(prnum);
			var dtype2 = this.getView().byId("dtype").getValue();

			var SplitTotalFoot3 = dtype2.split(" ");
			dtype2 = SplitTotalFoot3[0];
			//	alert(dtype);

			var htext2 = this.getView().byId("header").getValue();

			var that = this;
			var username = that.getView().getModel("oGlobalModel").getProperty("/username");

			that.table = sap.ui.core.Fragment.byId("messagefragment", "Msgtab"); ///// For Table Message
			var postdata = {

				"PRNumber": prnum2,
				"DocumentType": dtype2,
				"HeaderText": htext2,
				"DocumentDesc": "",
				"Username": username,
				"SupervisorText": that.sText,
				"Header2ReleaseStrategy": {
					"Decision": "Reject"
				},
				"Header2Return": [{
					"Type": "",
					"Message": ""
				}]

			};

			//	that.busyDialogFun();
			console.log("Postdata:", postdata);

			var oModel3 = new sap.ui.model.odata.ODataModel("/sap/opu/odata/sap/ZMM_PR_APPROVAL_SRV/", true);

			var pos = [];

			var sPath = "/CreateHeaderSet";

			oModel3.create(sPath, postdata, {
				success: function (oData, oResponse) {
					console.log(oData, "oData");
					console.log(oResponse, "oResponse");

					//debugger;	

					that.msg1 = oData.Header2Return.results[0].Message;
					console.log("that.msg1", that.msg1);

					var tablen = oData.Header2Return.results.length;

					for (var j = 0; j < tablen; j++) {

						var Type = oData.Header2Return.results[j].Type;
						console.log("Type", Type);

						if (Type === "I") {

							Type = "Information";
							console.log("Type", Type);

						} else if (Type === "S") {

							Type = "Success";
							console.log("Type", Type);

						} else if (Type === "E") {

							Type = "Error";
							console.log("Type", Type);

						} else if (Type === "W") {

							Type = "Warning";
							console.log("Type", Type);

						}

						var Message = oData.Header2Return.results[j].Message;
						console.log("Message", Message);

						var obj = {
							Type2: Type,
							Message: Message
						};

						pos.push(obj);

					}

					that.msg.open();

					var oTemplate = new sap.m.ColumnListItem({

						cells: [
							/*new sap.m.Text({
								text: "{Type}"
							}),*/

							new sap.m.Text({
								text: "{Message}"
							})
						]
					});

					var oModelJson = new sap.ui.model.json.JSONModel();
					oModelJson.setData({
						tabdata1: pos
					});
					that.table.setModel(oModelJson);
					that.table.bindItems("/tabdata1", oTemplate);

				},
				error: function (oData, oResponse) {

					var msg1 = oData.Message;
					console.log("msg1", msg1);

					sap.m.MessageBox.warning(msg1 + " ", {
						icon: sap.m.MessageBox.Icon.WARNING,
						title: "Warning",
						actions: [sap.m.MessageBox.Action.OK],

					});
				}
			});

		},

		status: function (a) {
			if (a === 'Open') {
				return "Warning";
			} else if (a === 'Released') {
				return "Success";
			} else {
				return "Error";
			}
		},

		_onUploadCollectionUploadComplete: function (oEvent) {

			var oFile = oEvent.getParameter("files")[0];
			var iStatus = oFile ? oFile.status : 500;
			var sResponseRaw = oFile ? oFile.responseRaw : "";
			var oSourceBindingContext = oEvent.getSource().getBindingContext();
			var sSourceEntityId = oSourceBindingContext ? oSourceBindingContext.getProperty("") : null;
			var oModel = this.getView().getModel();

			return new Promise(function (fnResolve, fnReject) {
				if (iStatus !== 200) {
					fnReject(new Error("Upload failed"));
				} else if (oModel.hasPendingChanges()) {
					fnReject(new Error("Please save your changes, first"));
				} else if (!sSourceEntityId) {
					fnReject(new Error("No source entity key"));
				} else {
					try {
						var oResponse = JSON.parse(sResponseRaw);
						var oNewEntityInstance = {};

						oNewEntityInstance[""] = oResponse["ID"];
						oNewEntityInstance[""] = sSourceEntityId;
						oModel.createEntry("", {
							properties: oNewEntityInstance
						});
						oModel.submitChanges({
							success: function (oResponse) {
								var oChangeResponse = oResponse.__batchResponses[0].__changeResponses[0];
								if (oChangeResponse && oChangeResponse.response) {
									oModel.resetChanges();
									fnReject(new Error(oChangeResponse.message));
								} else {
									oModel.refresh();
									fnResolve();
								}
							},
							error: function (oError) {
								fnReject(new Error(oError.message));
							}
						});
					} catch (err) {
						var message = typeof err === "string" ? err : err.message;
						fnReject(new Error("Error: " + message));
					}
				}
			}).catch(function (err) {
				if (err !== undefined) {
					MessageBox.error(err.message);
				}
			});

		},
		_onUploadCollectionChange: function (oEvent) {

			var oUploadCollection = oEvent.getSource();
			var aFiles = oEvent.getParameter('files');

			if (aFiles && aFiles.length) {
				var oFile = aFiles[0];
				var sFileName = oFile.name;

				var oDataModel = this.getView().getModel();
				if (oUploadCollection && sFileName && oDataModel) {
					var sXsrfToken = oDataModel.getSecurityToken();
					var oCsrfParameter = new sap.m.UploadCollectionParameter({
						name: "x-csrf-token",
						value: sXsrfToken
					});
					oUploadCollection.addHeaderParameter(oCsrfParameter);
					var oContentDispositionParameter = new sap.m.UploadCollectionParameter({
						name: "content-disposition",
						value: "inline; filename=\"" + encodeURIComponent(sFileName) + "\""
					});
					oUploadCollection.addHeaderParameter(oContentDispositionParameter);
				} else {
					throw new Error("Not enough information available");
				}
			}

		},
		_onUploadCollectionTypeMissmatch: function () {
			return new Promise(function (fnResolve) {
				sap.m.MessageBox.warning(
					"The file you are trying to upload does not have an authorized file type (JPEG, JPG, GIF, PNG, TXT, PDF, XLSX, DOCX, PPTX).", {
						title: "Invalid File Type",
						onClose: function () {
							fnResolve();
						}
					});
			}).catch(function (err) {
				if (err !== undefined) {
					MessageBox.error(err);
				}
			});

		},
		_onUploadCollectionFileSizeExceed: function () {
			return new Promise(function (fnResolve) {
				sap.m.MessageBox.warning("The file you are trying to upload is too large (10MB max).", {
					title: "File Too Large",
					onClose: function () {
						fnResolve();
					}
				});
			}).catch(function (err) {
				if (err !== undefined) {
					MessageBox.error(err);
				}
			});

		},

		/*Function for closing the Fragment after Posting Status*/
		msgtableok: function () {

			var inf_arr = [];

			var err_arr = [];

			var rowItems = sap.ui.core.Fragment.byId("messagefragment", "Msgtab").getItems();

			//	this.msg.close();

			var tablength = rowItems.length;

			console.log("tablength", tablength);

			for (var i = 0; i < tablength; i++) {

				var item = rowItems[i];

				var Cells = item.getCells();

				var tp = Cells[0].getText();

				if (tp === "Success") {

					var inf = {
						tp: tp
					};

					inf_arr.push(inf);

					var len_inf = inf_arr.length;

				} else if (tp === "Error") {

					var err = {
						tp: tp
					};

					err_arr.push(err);

					var len_err = err_arr.length;

				}

			}

			if (len_inf === tablength) {

				// this.getView().byId("disp_conf_btn").setVisible(false);
				// this.oRouter.navTo("master");
				this._onCloseButtonPress();
				window.location.reload();

			} else {

			}
			
			// this.oRouter.navTo("master");
			this._onCloseButtonPress();
			window.location.reload();
			this.msg.close();

		},

		/*Function for the Approve and Convert to Po Button */
		Appr_po: function () {

			this.sign_frag.open();

		},

		Appr_pr: function () {

			var oCont = this;

			var dialog = new sap.m.Dialog({
				title: 'Confirmation',
				type: 'Message',
				content: [
					new sap.ui.layout.HorizontalLayout({
						content: [
							new sap.ui.layout.VerticalLayout({
								width: "100%",
								height: "100%",
								content: [
									new sap.m.Label({
										text: 'Are you sure you want to Approve Purchase Requisition?',
										text1: " ",
										labelFor: 'submitDialogTextarea'
									}),
								]
							})
						]
					}),

					new sap.m.TextArea('submitDialogTextarea', {

						liveChange: function (oEvent) {
							oCont.sText = oEvent.getParameter('value');
							var parent = oEvent.getSource().getParent();
							//alert(sText);
							parent.getBeginButton().setEnabled(sText);
						},
						maxLength: 50,
						width: '100%',
						placeholder: 'Add note'
					})
				],
				beginButton: new sap.m.Button({
					text: 'Yes',
					enabled: true,
					press: function () {
						oCont.sText = sap.ui.getCore().byId('submitDialogTextarea').getValue();
						oCont.Appr_pr1();
						dialog.close();

					}
				}),
				endButton: new sap.m.Button({
					text: 'No',
					press: function () {
						dialog.close();
					}
				}),
				afterClose: function () {
					dialog.destroy();
				}
			});

			dialog.open();

		},
		/*Function for the Approve PR*/
		Appr_pr1: function () {

			var prnum = this.getView().byId("objh").getObjectTitle();
			//	alert(prnum);
			var dtype = this.getView().byId("dtype").getValue();

			var SplitTotalFoot3 = dtype.split(" ");
			dtype = SplitTotalFoot3[0];
			//	alert(dtype);

			var htext = this.getView().byId("header").getValue();
			//alert(htext);

			// var ddesc = this.getView().byId("dtype").getValue();
			// alert(ddesc);
			// var SplitTotalFoot5 = ddesc.split("");
			// ddesc = SplitTotalFoot5[1];
			// alert(ddesc);

			var that = this;
			var username = that.getView().getModel("oGlobalModel").getProperty("/username");
			console.log(username);
			that.table = sap.ui.core.Fragment.byId("messagefragment", "Msgtab"); ///// For Table Message

			var postdata = {

				"PRNumber": prnum,
				"DocumentType": dtype,
				"HeaderText": htext,
				"DocumentDesc": "",
				"Username": username,
				"SupervisorText": that.sText,
				"Header2ReleaseStrategy": {
					"Decision": "Approve"
				},
				"Header2Return": [{
					"Type": "",
					"Message": ""
				}]

			};

			//	that.busyDialogFun();
			console.log("Postdata:", postdata);

			var oModel3 = new sap.ui.model.odata.ODataModel("/sap/opu/odata/sap/ZMM_PR_APPROVAL_SRV/", true);

			var pos = [];

			var sPath = "/CreateHeaderSet";

			oModel3.create(sPath, postdata, {
				success: function (oData, oResponse) {
					console.log(oData, "oData");
					console.log(oResponse, "oResponse");

					//debugger;	

					that.msg1 = oData.Header2Return.results[0].Message;
					console.log("that.msg1", that.msg1);

					var tablen = oData.Header2Return.results.length;

					for (var j = 0; j < tablen; j++) {

						var Type = oData.Header2Return.results[j].Type;
						console.log("Type", Type);

						if (Type === "I") {

							Type = "Information";
							console.log("Type", Type);

						} else if (Type === "S") {

							Type = "Success";
							console.log("Type", Type);

						} else if (Type === "E") {

							Type = "Error";
							console.log("Type", Type);

						} else if (Type === "W") {

							Type = "Warning";
							console.log("Type", Type);

						}

						var Message = oData.Header2Return.results[j].Message;
						console.log("Message", Message);

						var obj = {
							Type2: Type,
							Message: Message
						};

						pos.push(obj);

					}

					that.msg.open();

					var oTemplate = new sap.m.ColumnListItem({

						cells: [
							/*	new sap.m.Text({
									text: "{Type}"
								}),*/

							new sap.m.Text({
								text: "{Message}"
							})
						]
					});

					var oModelJson = new sap.ui.model.json.JSONModel();
					oModelJson.setData({
						tabdata1: pos
					});
					that.table.setModel(oModelJson);
					that.table.bindItems("/tabdata1", oTemplate);

				},
				error: function (oData, oResponse) {
					console.log(oData);
					console.log(oResponse);
					var msg1 = oData.Message;
					console.log("msg1", msg1);

					sap.m.MessageBox.warning(msg1 + " ", {
						icon: sap.m.MessageBox.Icon.WARNING,
						title: "Warning",
						actions: [sap.m.MessageBox.Action.OK]

					});
				}
			});
		},

		Canc_pr: function () {
			var oCont = this;

			var dialog = new sap.m.Dialog({
				title: 'Confirmation',
				type: 'Message',
				content: [
					new sap.ui.layout.HorizontalLayout({
						content: [
							new sap.ui.layout.VerticalLayout({
								width: "100%",
								height: "100%",
								content: [
									new sap.m.Label({
										text: 'Are you sure you want to Cancel Purchase Requisition?',
										text1: " ",
										labelFor: 'submitDialogTextarea'
									}),
								]
							})
						]
					}),

					new sap.m.TextArea('submitDialogTextarea', {

						liveChange: function (oEvent) {
							oCont.sText = oEvent.getParameter('value');
							var parent = oEvent.getSource().getParent();
							//alert(sText);
							parent.getBeginButton().setEnabled(sText);
						},
						maxLength: 50,
						width: '100%',
						placeholder: 'Add note'
					})
					//	this.getView().getModel("oGlobalModel").setProperty("/textarea",sText); 
				],
				beginButton: new sap.m.Button({
					text: 'Yes',
					enabled: true,
					press: function () {
						oCont.sText = sap.ui.getCore().byId('submitDialogTextarea').getValue();
						oCont.Canc_pr1();
						dialog.close();

					}
				}),
				endButton: new sap.m.Button({
					text: 'No',
					press: function () {
						dialog.close();
					}
				}),
				afterClose: function () {
					dialog.destroy();
				}
			});

			dialog.open();

		},
		/*For the Cancellation of PR*/
		Canc_pr1: function () {

			var prnum2 = this.getView().byId("objh").getObjectTitle();
			//	alert(prnum);
			var dtype2 = this.getView().byId("dtype").getValue();

			var SplitTotalFoot3 = dtype2.split(" ");
			dtype2 = SplitTotalFoot3[0];
			//	alert(dtype);

			var htext2 = this.getView().byId("header").getValue();

			var that = this;
			var username = that.getView().getModel("oGlobalModel").getProperty("/username");

			that.table = sap.ui.core.Fragment.byId("messagefragment", "Msgtab"); ///// For Table Message
			var postdata = {

				"PRNumber": prnum2,
				"DocumentType": dtype2,
				"HeaderText": htext2,
				"DocumentDesc": "",
				"Username": username,
				"SupervisorText": that.sText,
				"Header2ReleaseStrategy": {
					"Decision": "CANCEL"
				},
				"Header2Return": [{
					"Type": "",
					"Message": ""
				}]

			};

			//	that.busyDialogFun();
			console.log("Postdata:", postdata);

			var oModel3 = new sap.ui.model.odata.ODataModel("/sap/opu/odata/sap/ZMM_PR_APPROVAL_SRV/", true);

			var pos = [];

			var sPath = "/CreateHeaderSet";

			oModel3.create(sPath, postdata, {
				success: function (oData, oResponse) {
					console.log(oData, "oData");
					console.log(oResponse, "oResponse");

					//debugger;	

					that.msg1 = oData.Header2Return.results[0].Message;
					console.log("that.msg1", that.msg1);

					var tablen = oData.Header2Return.results.length;

					for (var j = 0; j < tablen; j++) {

						var Type = oData.Header2Return.results[j].Type;
						console.log("Type", Type);

						if (Type === "I") {

							Type = "Information";
							console.log("Type", Type);

						} else if (Type === "S") {

							Type = "Success";
							console.log("Type", Type);

						} else if (Type === "E") {

							Type = "Error";
							console.log("Type", Type);

						} else if (Type === "W") {

							Type = "Warning";
							console.log("Type", Type);

						}

						var Message = oData.Header2Return.results[j].Message;
						console.log("Message", Message);

						var obj = {
							Type2: Type,
							Message: Message
						};

						pos.push(obj);

					}

					that.msg.open();

					var oTemplate = new sap.m.ColumnListItem({

						cells: [
							/*new sap.m.Text({
								text: "{Type}"
							}),*/

							new sap.m.Text({
								text: "{Message}"
							})
						]
					});

					var oModelJson = new sap.ui.model.json.JSONModel();
					oModelJson.setData({
						tabdata1: pos
					});
					that.table.setModel(oModelJson);
					that.table.bindItems("/tabdata1", oTemplate);

				},
				error: function (oData, oResponse) {

					var msg1 = oData.Message;
					console.log("msg1", msg1);

					sap.m.MessageBox.warning(msg1 + " ", {
						icon: sap.m.MessageBox.Icon.WARNING,
						title: "Warning",
						actions: [sap.m.MessageBox.Action.OK],

					});
				}
			});

		},

		show: function (oEvent) {

			//alert("passed")

			this.ci_att11 = [];
			var that = this;

			that.user = parent.sap.ushell.Container.getUser().getId();
			that.Prnumber = this.getOwnerComponent().getModel("oGlobalModel").getProperty("/doc");
			console.log("Documents Odata: ", that.user);
			console.log("Documents Odata: ", that.Prnumber);

			that.showatt = that.getView().byId("UploadCollection1");
			// var sPath = "/DMSListSet?$filter=ILoginUser eq '" + that.user + "' and IProcess eq 'CreateMP' and IMaintId eq '" + that.Prnumber +" '"; // " + that.measure + "  
			var sPath = "/DMSListSet?$filter=ILoginUser eq '" + that.user + "' and IProcess eq 'PR_APPLICATION' and IMaintId eq '" + that.Prnumber +
				"'";

			var oModeli = new sap.ui.model.odata.ODataModel('/sap/opu/odata/sap/ZPRJ_PM_APPS_IH_SRV', true);
			//debugger;

			oModeli.read(sPath, {
				success: function (oData, oResponse) {
					var len1 = oData.results.length;
					console.log("Documents Odata: ", oData);
					for (var i = 0; i < len1; i++) {
						that.FileName = oData.results[i].FileName;
						that.FileExt = oData.results[i].FileExt;
						that.docnum = oData.results[i].DocNumber;

						that.ci_obj1 = {
							Name: that.FileName,
							Ext: that.FileExt,
							Doc: that.docnum
						};
						that.ci_att11.push(that.ci_obj1);

					}
					var oModel = new sap.ui.model.json.JSONModel(that.ci_att11);
					that.showatt.setModel(oModel); //For Loop End
					var oItems = new sap.m.ObjectListItem({
						icon: {
							path: "Ext",
							formatter: function (subject) {
								var lv = subject;
								if (lv === 'TXT') {
									return "sap-icon://document-text";
								} else if (lv === 'JPG' || lv === 'PNG' || lv === 'BMP') {
									return "sap-icon://attachment-photo";
								} else if (lv === 'PDF') {
									return "sap-icon://pdf-attachment";
								} else if (lv === 'DOC') {
									return "sap-icon://doc-attachment";
								} else if (lv === 'XLS') {
									return "sap-icon://excel-attachment";
								} else if (lv === 'MP3') {
									return "sap-icon://attachment-audio";
								} else if (lv === 'XLS') {
									return "sap-icon://excel-attachment";
								} else if (lv === 'PPT') {
									return "sap-icon://ppt-attachment";
								} else {
									return "sap-icon://document";
								}

							}
						},
						title: "{Name}.{Ext}",
						type: "Active"
					});
					// that.showatt.bindItems("/", oItems);
					// var aModel = new sap.ui.model.json.JSONModel(that.ci_att11);

					// that.getView().byId("UploadCollection1").setModel(aModel);
					that.showatt.bindItems("/", oItems);
					that.getView().getModel("oGlobalModel").setProperty("/ci_att1", that.ci_att11);

				}
			});

		},

		/*Ok Function for the Signature Fragment*/
		sign_ok: function () {

			this.sign_frag.close();

		},

		/*Cancel Function for the /*/
		Sign_cancel: function () {

			this.sign_frag.close();

		},

		/******************Signature Pad Draw************************/

		onSign: function (oEvent) {
			var canvas = document.getElementById("signature-pad");
			//debugger;
			var context = canvas.getContext("2d");
			canvas.width = 1000;
			canvas.height = 400;
			context.fillStyle = "#fff";
			context.strokeStyle = "#444";
			context.lineWidth = 1.5;
			context.lineCap = "round";
			context.fillRect(0, 0, canvas.width, canvas.height);
			var disableSave = true;
			var pixels = [];
			var cpixels = [];
			var xyLast = {};
			var xyAddLast = {};
			var calculate = false; { //functions
				function remove_event_listeners() {
					canvas.removeEventListener('mousemove', on_mousemove, false);
					canvas.removeEventListener('mouseup', on_mouseup, false);
					canvas.removeEventListener('touchmove', on_mousemove, false);
					canvas.removeEventListener('touchend', on_mouseup, false);

					document.body.removeEventListener('mouseup', on_mouseup, false);
					document.body.removeEventListener('touchend', on_mouseup, false);
				}

				function get_coords(e) {
					var x, y;

					if (e.changedTouches && e.changedTouches[0]) {
						var offsety = canvas.offsetTop || 0;
						var offsetx = canvas.offsetLeft || 0;

						x = e.changedTouches[0].pageX - offsetx;
						y = e.changedTouches[0].pageY - offsety;
					} else if (e.layerX || 0 == e.layerX) {
						x = e.layerX;
						y = e.layerY;
					} else if (e.offsetX || 0 == e.offsetX) {
						x = e.offsetX;
						y = e.offsetY;
					}

					return {
						x: x,
						y: y
					};
				};

				function on_mousedown(e) {
					e.preventDefault();
					e.stopPropagation();

					canvas.addEventListener('mouseup', on_mouseup, false);
					canvas.addEventListener('mousemove', on_mousemove, false);
					canvas.addEventListener('touchend', on_mouseup, false);
					canvas.addEventListener('touchmove', on_mousemove, false);

					document.body.addEventListener('mouseup', on_mouseup, false);
					document.body.addEventListener('touchend', on_mouseup, false);

					var empty = false;
					var xy = get_coords(e);
					context.beginPath();
					pixels.push('moveStart');
					context.moveTo(xy.x, xy.y);
					pixels.push(xy.x, xy.y);
					xyLast = xy;
				};

				function on_mousemove(e, finish) {
					e.preventDefault();
					e.stopPropagation();

					var xy = get_coords(e);
					var xyAdd = {
						x: (xyLast.x + xy.x) / 2,
						y: (xyLast.y + xy.y) / 2
					};

					if (calculate) {
						var xLast = (xyAddLast.x + xyLast.x + xyAdd.x) / 3;
						var yLast = (xyAddLast.y + xyLast.y + xyAdd.y) / 3;
						pixels.push(xLast, yLast);
					} else {
						calculate = true;
					}

					context.quadraticCurveTo(xyLast.x, xyLast.y, xyAdd.x, xyAdd.y);
					pixels.push(xyAdd.x, xyAdd.y);
					context.stroke();
					context.beginPath();
					context.moveTo(xyAdd.x, xyAdd.y);
					xyAddLast = xyAdd;
					xyLast = xy;

				};

				function on_mouseup(e) {
					remove_event_listeners();
					disableSave = false;
					context.stroke();
					pixels.push('e');
					calculate = false;
				};

				canvas.addEventListener('touchstart', on_mousedown, false);
				canvas.addEventListener('mousedown', on_mousedown, false);
			}

		},
		downListPress: function (oEvent) {
			var that = this;
			that.fle1 = oEvent.getParameter("listItem").getBindingContext().getProperty().Name;
			that.ext2 = oEvent.getParameter("listItem").getBindingContext().getProperty().Ext;
			that.docnum = oEvent.getParameter("listItem").getBindingContext().getProperty().Doc;

			sap.m.MessageBox.show(
				"Do you want to download the Attachment ?", {
					icon: sap.m.MessageBox.Icon.INFORMATION,
					title: "Confirmation Message",
					actions: [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO],
					onClose: function (oAction) {
						// notify user
						if (oAction == "YES") {
							that.fle = that.fle1.toUpperCase();
							console.log("that.fle", that.fle);
							that.ext = that.ext2.toUpperCase();
							console.log("that.ext", that.ext);
							var oModel3 = new sap.ui.model.odata.ODataModel("/sap/opu/odata/sap/ZPRJ_PM_APPS_IH_SRV/", true);
							var sPath = "/DMS_Base64Set?$filter=DocumentNum eq '" + that.docnum + "'and IFilename eq '" + that.fle + "." + that.ext +
								"'";
							oModel3.read(sPath, {
								success: function (oData, oResponse) {
									var length = oData.results.length;
									// that.getView().getModel("oviewModel").setProperty("/busy", true);
									for (var i = 0; i < length; i++) {
										that.base64 = oData.results[i].LvBase64;
										that.doctype = oData.results[i].DocumentNum;
										console.log("that.doctype", that.doctype);
										that.downloads();
									}
								},

							});

						} else {

						}
					}
				});

		},
		downloads: function () {

			var that = this;
			download("data:application/+ that.FileExt;base64," + that.base64, that.fle + "." + that.ext, "application");

		},

		/***********Download the Signature Pad********************/

		saveButton: function (oEvent) {
			var canvas = document.getElementById("signature-pad");
			var link = document.createElement('a');
			link.href = canvas.toDataURL('image/jpeg');
			link.download = 'sign.jpeg';
			link.click();
			var signaturePad = new SignaturePad(document.getElementById('signature-pad'), {
				backgroundColor: '#ffffff',
				penColor: 'rgb(0, 0, 0)'
			});
		},

		clearButton: function (oEvent) {
			var canvas = document.getElementById("signature-pad");
			var context = canvas.getContext("2d");
			context.clearRect(0, 0, canvas.width, canvas.height);

		}
	});

});