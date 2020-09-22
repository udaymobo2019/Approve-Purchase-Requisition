sap.ui.define([
	"./BaseController",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/routing/History",
	"sap/ui/model/Filter",
	"sap/ui/model/Sorter",
	"sap/ui/model/FilterOperator",
	"sap/m/GroupHeaderListItem",
	"sap/ui/Device",
	"sap/m/MessageBox",
	"sap/ui/model/odata/ODataModel",
	"sap/ui/core/Fragment",
	"../model/formatter"
], function (BaseController, JSONModel, History, MessageBox, Filter, ODataModel, Sorter, FilterOperator, GroupHeaderListItem, Device,
	Fragment, formatter) {
	"use strict";

	return BaseController.extend("app.prapprovalgrunt.controller.Master", {

		formatter: formatter,

		/* =========================================================== */
		/* lifecycle methods                                           */
		/* =========================================================== */

		/**
		 * Called when the master list controller is instantiated. It sets up the event handling for the master/detail communication and other lifecycle tasks.
		 * @public
		 */
		onInit: function () {
			// Control state model
			this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			this.oRouter.attachRouteMatched(this.handleRouteMatched, this);
			this.getOwnerComponent().getModel("oGlobalModel").setProperty("/delay", true);
			var that = this;
			var oModel1 = new sap.ui.model.json.JSONModel();
			/* Assign the model to the view */
			this.getView().setModel(oModel1);
			/* Load the data */
			oModel1.loadData("/services/userapi/currentUser");
			oModel1.attachRequestCompleted(function onCompleted(oEvent) {
				this.suser = oModel1.oData.name;

				var firstname = oModel1.oData.firstName;
				var lastname = oModel1.oData.lastName;
				this.fullname = firstname + " " + lastname;
				//that.getView().getModel("oGlobalModel").setProperty("/logid", this.suser);
				console.log("this.suser", this.suser);
				console.log("this.fullname", this.fullname);

				if (this.suser === "undefined") {

				} else {
					that.Suserid = this.suser;
					that.useraccess();
					that.getView().getModel("oGlobalModel").setProperty("/logid", that.Suserid);
				}
			});

			//	this.PrList();
			//sap.ui.core.BusyIndicator.show();
		},
		handleRouteMatched: function () {

		},
		useraccess: function () {
			var filters = [];
			var that = this;
			var oModel = new sap.ui.model.odata.ODataModel('/sap/opu/odata/sap/zpm_f4_srv/', true);
			filters.push(new sap.ui.model.Filter("UserName", sap.ui.model.FilterOperator.EQ, "")); //user1
			filters.push(new sap.ui.model.Filter("SUserId", sap.ui.model.FilterOperator.EQ, that.Suserid)); //this.logid1
			filters.push(new sap.ui.model.Filter("ApplicationName", sap.ui.model.FilterOperator.EQ, "PRAPPROVAL"));
			var sService = "/User_AccessSet";

			oModel.read(sService, {
				filters: filters,
				success: function (oData, oResponse) {
					var that = this;
					var len = oData.results.length;
					console.log(oData);
					that.username = oData.results[0].UserName;
					console.log(that.username);
					that.appliName = oData.results[0].ApplicationName;
					console.log(that.appliName);
					that.getView().getModel("oGlobalModel").setProperty("/username", that.username); //Added code
					that.getView().getModel("oGlobalModel").setProperty("/appliname", that.appliName); //Added code
					if (oData.results[0].Authorization === "X") {

						that.PrList();
					} else {
						jQuery.sap.require("sap.m.MessageBox");
						sap.m.MessageBox.error(
							"You Are Not Authorised to Access this application", {
								icon: sap.m.MessageBox.Icon.ERROR,
								actions: [sap.m.MessageBox.Action.CLOSE],
								onClose: function (oAction) {
									var navUrl =
										"https://dashboarddesigngrunt-ba293bd41.dispatcher.us1.hana.ondemand.com/index.html?hc_reset#/PM"
									sap.m.URLHelper.redirect(navUrl, false);
								}
							});
					}
				}.bind(this)
			});

		},
		PrList: function () {
			var list = this.getView().byId("List");
			this.arrL = [];
			var that = this;
			that.getView().getModel("oGlobalModel").setProperty("/delay", true);
			var spath = "/MasterPRSet";
			var oModel = new sap.ui.model.odata.ODataModel('/sap/opu/odata/sap/ZMM_PR_APPROVAL_SRV', true);
			oModel.read(spath, {
				filters: [new sap.ui.model.Filter("ImApprover", sap.ui.model.FilterOperator.EQ, that.username),
					new sap.ui.model.Filter("Status", sap.ui.model.FilterOperator.EQ, '')
				],
				success: function (oData, oResponse) {
					that.getView().getModel("oGlobalModel").setProperty("/delay", false);
					var count = oData.results.length;
					for (var i = 0; i < count; i++) {
						var curcy = oData.results[i].Currency; ///// PR Currency Type
						var prnum = oData.results[i].PRnumber; ///////PR Number
						var purorg = oData.results[i].PurchaseOrganization + " " + oData.results[i].PurchaseOrgDesc; /////PR Org	and Desc										/// Purch Org
						var plant = oData.results[i].Plant + " " + oData.results[i].PlantDesc; ///Plant and Desc											/// Plant
						var price = oData.results[i].PRPrice; ////PR Price
						var cdate = oData.results[i].CreatedDate; ///// PR Created Date

						var year = cdate.slice(0, 4);
						var month = cdate.slice(4, 6);
						var date = cdate.slice(6, 8);
						cdate = month + "." + date + "." + year;

						var obj = {
							desc: curcy, //// PR Currency
							point: prnum, /////PR Number
							eqno: purorg, /// PR Org		
							funlno: plant, //// Plant
							sta: price, ///////PR Price
							cate: cdate ////PR Created Date
						};

						that.arrL.push(obj);
					}
					//debugger;
					var oModelj = new JSONModel();
					oModelj.setData({
						listdata: that.arrL
					});
					list.setModel(oModelj);

				}
			});

		},
		approval: function () {
			var list = this.getView().byId("List");
			this.arrL = [];
			var that = this;
			that.getView().getModel("oGlobalModel").setProperty("/delay", true);
			var spath = "/MasterPRSet";
			var oModel = new sap.ui.model.odata.ODataModel('/sap/opu/odata/sap/ZMM_PR_APPROVAL_SRV', true);
			oModel.read(spath, {
				filters: [new sap.ui.model.Filter("ImApprover", sap.ui.model.FilterOperator.EQ, that.username),
					new sap.ui.model.Filter("Status", sap.ui.model.FilterOperator.EQ, 'APPROVED')
				],
				success: function (oData, oResponse) {
					that.getView().getModel("oGlobalModel").setProperty("/delay", false);
					var count = oData.results.length;
					for (var i = 0; i < count; i++) {
						var curcy = oData.results[i].Currency; ///// PR Currency Type
						var prnum = oData.results[i].PRnumber; ///////PR Number
						var purorg = oData.results[i].PurchaseOrganization + " " + oData.results[i].PurchaseOrgDesc; /////PR Org	and Desc										/// Purch Org
						var plant = oData.results[i].Plant + " " + oData.results[i].PlantDesc; ///Plant and Desc											/// Plant
						console.log(plant);
						var price = oData.results[i].PRPrice; ////PR Price
						var cdate = oData.results[i].CreatedDate; ///// PR Created Date

						var year = cdate.slice(0, 4);
						var month = cdate.slice(4, 6);
						var date = cdate.slice(6, 8);
						cdate = date + "." + month + "." + year;

						var obj = {
							desc: curcy, //// PR Currency
							point: prnum, /////PR Number
							eqno: purorg, /// PR Org		
							funlno: plant, //// Plant
							sta: price, ///////PR Price
							cate: cdate ////PR Created Date
						};

						that.arrL.push(obj);
					}
					//debugger;
					var oModelj = new JSONModel();
					oModelj.setData({
						listdata: that.arrL
					});
					list.setModel(oModelj);

				}
			});

		},
		open: function () {
			var list = this.getView().byId("List");
			this.arrL = [];
			var that = this;
			that.getView().getModel("oGlobalModel").setProperty("/delay", true);
			var spath = "/MasterPRSet";
			var oModel = new sap.ui.model.odata.ODataModel('/sap/opu/odata/sap/ZMM_PR_APPROVAL_SRV', true);
			oModel.read(spath, {
				filters: [new sap.ui.model.Filter("ImApprover", sap.ui.model.FilterOperator.EQ, that.username),
					new sap.ui.model.Filter("Status", sap.ui.model.FilterOperator.EQ, '')
				],
				success: function (oData, oResponse) {
					that.getView().getModel("oGlobalModel").setProperty("/delay", false);
					var count = oData.results.length;
					for (var i = 0; i < count; i++) {
						var curcy = oData.results[i].Currency; ///// PR Currency Type
						var prnum = oData.results[i].PRnumber; ///////PR Number
						var purorg = oData.results[i].PurchaseOrganization + " " + oData.results[i].PurchaseOrgDesc; /////PR Org	and Desc										/// Purch Org
						var plant = oData.results[i].Plant + " " + oData.results[i].PlantDesc; ///Plant and Desc											/// Plant
						var price = oData.results[i].PRPrice; ////PR Price
						var cdate = oData.results[i].CreatedDate; ///// PR Created Date

						var year = cdate.slice(0, 4);
						var month = cdate.slice(4, 6);
						var date = cdate.slice(6, 8);
						cdate = date + "." + month + "." + year;

						var obj = {
							desc: curcy, //// PR Currency
							point: prnum, /////PR Number
							eqno: purorg, /// PR Org		
							funlno: plant, //// Plant
							sta: price, ///////PR Price
							cate: cdate ////PR Created Date
						};

						that.arrL.push(obj);
					}
					//debugger;
					var oModelj = new JSONModel();
					oModelj.setData({
						listdata: that.arrL
					});
					list.setModel(oModelj);

				}
			});

		},
		_onObjectListItemPress: function (oEvent) {
			//	alert("pressed");
			//	this.doc = oEvent.getParameter("listItem").getBindingContext("oGlobalModel").getObject().PONumber;
			//	this.getView().getModel("oGlobalModel").setProperty("/doc", this.doc);
			//	alert(this.doc);

			//var oBindingContext = oEvent.getParameter("listItem").getBindingContext();
			this.measurepoint = oEvent.getParameter("listItem").getBindingContext().getProperty("point");
			this.getView().getModel("oGlobalModel").setProperty("/doc", this.measurepoint);
			this.oRouter.navTo("object", {
				mes: this.measurepoint
			});

		},

		_onCloseButtonPress: function () {
			window.location.replace(
				"https://dashboarddesigngrunt-ba293bd41.dispatcher.us1.hana.ondemand.com/index.html?hc_reset#/PM"
			);
		},
		/*Search Function For the PR List*/
		search: function (oEvent) {
			var SamTbl = oEvent.getParameter("newValue");
			var filters = new Array();
			var oFilter = new sap.ui.model.Filter([
					new sap.ui.model.Filter("desc", sap.ui.model.FilterOperator.Contains, SamTbl),
					new sap.ui.model.Filter("point", sap.ui.model.FilterOperator.Contains, SamTbl),
					new sap.ui.model.Filter("eqno", sap.ui.model.FilterOperator.Contains, SamTbl),
					new sap.ui.model.Filter("funlno", sap.ui.model.FilterOperator.Contains, SamTbl),
					new sap.ui.model.Filter("sta", sap.ui.model.FilterOperator.Contains, SamTbl),
					new sap.ui.model.Filter("cate", sap.ui.model.FilterOperator.Contains, SamTbl)

				],
				false);
			filters = (oFilter);
			var listItem = this.getView().byId("List");
			var binding = listItem.getBinding("items");
			binding.filter(filters);
		}
	});

});