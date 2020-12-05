import React, { Component } from "react";
import Cookies from "universal-cookie";
import { Label, Input, Button } from "reactstrap";
import { Tab } from "react-bootstrap-tabs/dist";
import ReactDOM from "react-dom";
import { Modal } from "react-bootstrap";
import "../../css/modal.css";
import {
  fieldEdited,
  createInputControl,
  validationCheck,
  fieldTypeAheadEdited,
  createRender,
  popover,
  deleteDocument,
} from "./CommonFunction.js";
const $ = require("jquery");

class FormBuilderSecond extends Component {
  constructor(props) {
    super(props);
    try {
      this.data = [];
      this.showMenu = false;
      this.allUploadFiles = [];
      this.fileUploadArray = [];
      this.showDiagram = this.showDiagram.bind(this);
      this.handleClose = this.handleClose.bind(this);
      this.typeAheadIndex = -1;
      this.body = this.props.body;

      this.formId = this.body["id"];

      this.fields = this.body["fields"];
      this.workspace = [];
      this.peopleNameJson = [];
      this.peopleIdJson = [];
      this.groupNameJson = [];
      this.groupIdJson = [];

      this.state = {};
      this.taskId = this.body["taskId"];
      this.processInstanceId = this.props.processInstanceId;
      this.fieldEdited = fieldEdited.bind(this);
      this.fieldTypeAheadEdited = fieldTypeAheadEdited.bind(this);
      this.createInputControl = createInputControl.bind(this);
      this.validationCheck = validationCheck.bind(this);
      this.workspaceClick = this.workspaceClick.bind(this);
      this.createRender = createRender.bind(this);
      this.popover = popover.bind(this);
      this.deleteDocument = deleteDocument.bind(this);
      this.values = {};
      console.log(this.fields);

      for (var i = 0; i < this.fields.length; i++) {
        if (
          this.fields[i]["type"] !== "upload" &&
          this.fields[i]["type"] !== "people" &&
          this.fields[i]["type"] !== "functional-group"
        ) {
          if (
            this.fields[i]["type"] != "headline-with-line" &&
            this.fields[i]["type"] != "headline"
          ) {
            if (
              this.fields[i]["type"] == "date" &&
              this.fields[i]["value"] != null &&
              this.fields[i]["value"] != ""
            ) {
              var dateSplit = this.fields[i]["value"].split("-");
              if (dateSplit[1].length == 1) {
                dateSplit[1] = "0" + dateSplit[1];
              }
              if (dateSplit[2].length == 1) {
                dateSplit[2] = "0" + dateSplit[2];
              }
              this.fields[i]["value"] =
                dateSplit[0] + "-" + dateSplit[1] + "-" + dateSplit[2];
            }
            this.values[this.fields[i]["id"]] = this.fields[i]["value"];
            if (this.fields[i]["value"] == null) this.fields[i]["value"] = "";
          }
        } else if (
          this.fields[i]["type"] == "people" ||
          this.fields[i]["type"] == "functional-group"
        ) {
          if (
            this.fields[i]["value"] == null ||
            this.fields[i]["value"] == ""
          ) {
            this.values[this.fields[i]["id"]] = null;
            this.fields[i]["value"] = "";
          } else {
            const requestOptions = {
              method: "GET",
              withCredentials: true,
            };
            if (!this.fields[i]["valueChanged"]) {
              this.values[this.fields[i]["id"]] = this.fields[i]["value"];

              //var response = "";
              var url = "";
              if (this.fields[i]["type"] == "people") {
                url =
                  localStorage.getItem("apiURL") +
                  "flowable-task/app/rest/users/" +
                  this.fields[i]["value"];
              } else if (this.fields[i]["type"] == "functional-group") {
                url =
                  localStorage.getItem("apiURL") +
                  "flowable-task/app/rest/workflow-groups/" +
                  this.fields[i]["value"];
              }

              $.ajax({
                url: url,
                method: "GET",
                async: false, // notice this line
                xhrFields: requestOptions,
                crossDomain: true,
                success: (response) => {
                  this.fields[i]["oldValue"] = this.fields[i]["value"];
                  if (this.fields[i]["type"] == "people") {
                    this.fields[i]["value"] = response["fullName"];
                  } else if (this.fields[i]["type"] == "functional-group") {
                    this.fields[i]["value"] = response["name"];
                  }
                  this.fields[i]["valueChanged"] = true;
                },
                error: (error) => {
                  alert("error");
                  this.fields[i]["valueChanged"] = true;
                  this.fields[i]["oldValue"] = this.fields[i]["value"];
                },
              });
            } else {
              this.values[this.fields[i]["id"]] = this.fields[i]["oldValue"];
            }
            if (this.fields[i]["type"] == "people") {
              url =
                localStorage.getItem("apiURL") +
                "GRCNextBPMN/findUserId?id=" +
                this.fields[i]["value"];
            } else if (this.fields[i]["type"] == "functional-group") {
              url =
                localStorage.getItem("apiURL") +
                "GRCNextBPMN/findGroupId?id=" +
                this.fields[i]["value"];
            }
            $.ajax({
              url: url,
              method: "GET",
              async: false, // notice this line
              xhrFields: requestOptions,
              crossDomain: true,
              success: (response) => {
                if (this.fields[i]["type"] == "people") {
                  this.peopleNameJson[i] = response[1];
                  this.peopleIdJson[i] = response[0];
                } else if (this.fields[i]["type"] == "functional-group") {
                  this.groupNameJson[i] = response[1];
                  this.groupIdJson[i] = response[0];
                }

                this.forceUpdate();
              },
              error: (error) => {
                alert("error");
              },
            });
          }
        } else if (
          this.fields[i]["type"] === "upload" &&
          this.fields[i]["value"] != null &&
          this.fields[i]["value"].length > 0
        ) {
          this.allUploadFiles[i] = this.fields[i]["value"];
          this.fileUploadArray[i] = true;
          var fileIds = "";
          for (var j = 0; j < this.fields[i]["value"].length; j++) {
            let fileId = this.fields[i]["value"][j];
            fileIds += fileId["id"];
            if (j < this.fields[i]["value"].length - 1) {
              fileIds += ",";
            }
          }

          this.values[this.fields[i]["id"]] = fileIds;
        }
      }
      console.log(this.values);

      this.extraFields = [];
      //this.innerFields = [];

      for (var i = 0; i < this.fields.length; i++) {
        if (
          this.fields[i].type == "headline-with-line" ||
          this.fields[i].type == "headline"
        ) {
          //Headline with underline will be super heading and normal headline will come under Headline with underline
          //if(this.fields[i].type=="headline-with-line" ){
          this.workspace.push(false);
          var k = i;
          this.extraFields.push(this.fields[i]);
          var boxFields = [];
          for (var j = i + 1; j < this.fields.length; j++) {
            //if(this.fields[j].type=="headline-with-line" || this.fields[j].type=="headline"){
            if (this.fields[j].type == "headline") {
              //	if(this.fields[j].type=="headline-with-line" ){

              break;
            } else {
              boxFields.push(this.fields[j]);
              i++;
            }
          }
          //this.innerFields.push(boxFields);
          this.fields[k]["boxFields"] = boxFields;
        } else {
          this.extraFields.push(this.fields[i]);
        }
      }

      this.forceUpdate();
      console.log(this.extraFields);
    } catch (error) {
      alert("error");
    }
  }

  submit = async () => {
    try {
      var validationSuccess = true;

      validationSuccess = this.validationCheck(
        this.fields,
        this.values,
        validationSuccess
      );

      /*for(var i=0;i<this.fields.length;i++){
			//console.log(this.fields[i]);
			//console.log(this.values[this.fields[i].id]);
			if(this.fields[i].type=="boolean"){
				if(this.fields[i].required && (this.values[this.fields[i].id]==="" || this.values[this.fields[i].id] === null || 
			typeof this.values[this.fields[i].id] === 'undefined' || this.values[this.fields[i].id] === false)){
				alert(this.fields[i].name + " Cannot be Empty");
				validationSuccess=false;
				break;
			}
			}
			else if(this.fields[i].type!=="dropdown"){
			if(this.fields[i].required && (this.values[this.fields[i].id]==="" || this.values[this.fields[i].id] === null || 
			typeof this.values[this.fields[i].id] === 'undefined' )){
				alert(this.fields[i].name + " Cannot be Empty");
				validationSuccess=false;
				break;
			}
			}else if(this.fields[i].required && ( this.values[this.fields[i].id] === null || this.fields[i].options[0].name===this.values[this.fields[i].id] ||
			typeof this.values[this.fields[i].id] === 'undefined' )){
				alert("Select a value for "+this.fields[i].name );
				validationSuccess=false;
				break;
			}
		}
		*/

      if (validationSuccess) {
        //var date = new Date();
        // var today = date.getDate()+"-"+date.getMonth()+"-"+date.getFullYear();

        var json = {};

        json["formId"] = this.formId;
        json["values"] = this.values;

        var requestBody = {
          headers: { "Content-Type": "application/json" },
          method: "POST",
          credentials: "include",
          body: JSON.stringify(json),
        };

        var response = await fetch(
          localStorage.getItem("apiURL") +
            "flowable-task/app/rest/task-forms/" +
            this.taskId,
          requestBody
        );

        if (!response.ok) {
          alert("error");
        } else {
          //var body = await response.json();
          // var processInstanceId = body["id"];
          alert("success");
          //ReactDOM.unmountComponentAtNode(FormBuilderSecond);
        }
      }
    } catch (error) {
      alert("catch error");
    }
  };

  handleClose = () => {
    this.showWorkFlow = false;
    this.forceUpdate();
  };

  showDiagram = () => {
    if (this.processInstanceId != "" && this.processInstanceId != null) {
      localStorage.setItem("processInstanceId", this.processInstanceId);
      var jsURL = localStorage.getItem("apiURL") + "GRCNextBPMN/workFlowFiles/";
      const angularScript = document.createElement("script");
      angularScript.src = jsURL + "angular.js";
      angularScript.async = false;
      document.body.appendChild(angularScript);

      const jQueryScript = document.createElement("script");
      jQueryScript.src = jsURL + "/jquery.js";
      jQueryScript.async = false;
      document.body.appendChild(jQueryScript);

      const jQueryMinScript = document.createElement("script");
      jQueryMinScript.src = jsURL + "/jquery.qtip.min.js";
      jQueryMinScript.async = false;
      document.body.appendChild(jQueryMinScript);

      const raphaelScript = document.createElement("script");
      raphaelScript.src = jsURL + "/raphael.min.js";
      raphaelScript.async = false;
      document.body.appendChild(raphaelScript);

      const bpmnDrawScript = document.createElement("script");
      bpmnDrawScript.src = jsURL + "/bpmn-draw.js";
      bpmnDrawScript.async = false;
      document.body.appendChild(bpmnDrawScript);

      const bpmnIconsScript = document.createElement("script");
      bpmnIconsScript.src = jsURL + "/bpmn-icons.js";
      bpmnIconsScript.async = false;
      document.body.appendChild(bpmnIconsScript);

      const polyLineScript = document.createElement("script");
      polyLineScript.src = jsURL + "/Polyline.js";
      polyLineScript.async = false;
      document.body.appendChild(polyLineScript);

      const displayModelScript = document.createElement("script");
      displayModelScript.src = jsURL + "/displaymodel.js";
      displayModelScript.async = false;
      document.body.appendChild(displayModelScript);

      this.showWorkFlow = true;
    } else {
      alert("No Data for WorkFlow");
    }
    this.forceUpdate();
  };

  handleTypeAheadChange = (id, index, nameJson, idJson, value) => {
    try {
      this.fieldTypeAheadEdited(
        id,
        value,
        index,
        this.fields,
        this.values,
        nameJson,
        idJson
      );
    } catch (error) {
      alert("error1");
    }
  };

  handleChange = async (e) => {
    try {
      this.fieldEdited(e, this.fields, this.values);
      /*	  var id = e.target.getAttribute('id');

        if(e.target.getAttribute('type')=="file"){
            
            var formData = new FormData();
			formData.append('file',e.target.files[0]);

            let  requestOptions = {
                headers : {},
                method: "POST",
				credentials:'include',
                body:formData   
            };

            var response = await fetch(localStorage.getItem("apiURL")+'flowable-task/app/rest/content/raw',requestOptions);
            if (!response.ok) {
                console.log("error");
            }else {
                var body = await response.json();
				this.values[id] = body["id"];
            }
        }else if(e.target.getAttribute('type')=="checkbox"){
			this.fields[e.target.getAttribute('index')]["value"] = e.target.checked;
            this.values[id] = e.target.checked;
			}
			else {
            this.fields[e.target.getAttribute('index')]["value"] = e.target.value;
            this.values[id] = e.target.value;
        }

        this.forceUpdate();
		 
		*/
    } catch (error) {
      alert("error");
    }
    console.log(this.values);
  };

  /* createInputControl=(row,index)=>{

        switch(row["type"]){
            
            case "text" : 
            case "integer" :
            case "decimal" : 
                return this.createInputFieldByType("text",row,index);
                
            case "upload" : 
		       return this.createFileByType("file",row,index,row);

            case "date" : 
                return this.createInputFieldByType("date",row,index);  

            case "multi-line-text" : 
                    return this.createTextArea(row,index);
        
            case "dropdown" : 
                return this.createSelectOptions("select",row,index); 

            case "radio-buttons" :
				
                return this.createRadioButton("radio",row,index);
				
			case "expression" :
                return this.createExpression("expression",row,index);	
			
			case "boolean" :
                return this.createInputFieldByType("checkbox",row,index);	

            default : 
                return <label>not found</label>;
        }        
    }

    createInputFieldByType=(type,row,index)=>{

        return  <div className="form-group">
                    <Label for={row["name"]}>{row["name"]}</Label>
					{Boolean(row["required"]) && (
						<Label style={{marginLeft:3}}>*</Label>
								)}
                    <Input name={row["name"]}
                        index={index}
                        type={type}
                        placeholder={row["name"]}
                        id={row["id"]}
                        value={row["value"]}
                        onChange={this.handleChange}
                        className="form-control"
						defaultChecked = {row["value"]}
						disabled={row["readOnly"]}
                        ></Input>
                </div>;
    }
	
	createFileByType=(type,row,index)=>{

        return  <div className="form-group">
                    <Label for={row["name"]}>{row["name"]}</Label>
					{Boolean(row["required"]) && (
						<Label style={{marginLeft:3}}>*</Label>
								)}
                    <Input name={row["name"]}
                        index={index}
                        type={type}
                        placeholder={row["name"]}
                        id={row["id"]}
                       // value="d"
                        onChange={this.handleChange}
                        className="form-control"
						disabled={row["readOnly"]}
                        ></Input>
                </div>;
    }

    createTextArea=(row,index)=>{
        return  <div className="form-group">
                    <Label for={row["name"]}>{row["name"]}</Label>
					{Boolean(row["required"]) && (
						<Label style={{marginLeft:3}}>*</Label>
								)}
                    <textarea  
                        name={row["name"]}
                        index={index}
                        className="form-control"
                        placeholder={row["name"]}
                        id={row["id"]}
                        value={row["value"]}
                        onChange={this.handleChange}
						disabled={row["readOnly"]}/>
						
                </div>;
    };

    createSelectOptions =(type, row,index) =>{

         return <div className="form-group">
					<Label for={row["name"]}>{row["name"]}</Label>
					{Boolean(row["required"]) && (
						<Label style={{marginLeft:3}}>*</Label>
								)}
                    <Input
                        name={row["name"]}
                        index={index}
                        type={type}
                        placeholder={row["name"]}
                        id={row["id"]}
                        value={row["value"]}
                        onChange={this.handleChange}
                        className="form-control"
						disabled={row["readOnly"]}>
                    
                        {Boolean(row["options"].length>0)  && (
                        row["options"].map((json,i) => (
                            <option key={i} value={json["name"]}>{json["name"]}</option>
                        )))}
                    </Input>
                </div>;
    }

    createRadioButton = (type, row,index) => {
        return <div className="form-group">
                    <Label for={row["name"]}>{row["name"]}</Label>
					{Boolean(row["required"]) && (
						<Label style={{marginLeft:3}}>*</Label>
								)}
                    <br></br>
                    {row["options"].map((opt,i) => (

						row["value"]==opt["name"]
						?
                        <div className="form-check form-check-inline">
                            <input                                
                                name={row["name"]} 
                                key={i}
                                index={index} 
                                type={type} 
                                id={row["id"]} 
                                value={opt["name"]}
                                onChange={this.handleChange}
                                className="form-check-input"
								 disabled={row["readOnly"]}
								 defaultChecked >
                            </input>
                            <label className="form-check-label">{opt["name"]}</label>
                        </div>
					:	
					<div className="form-check form-check-inline">
                            <input                                
                                name={row["name"]} 
                                key={i}
                                index={index} 
                                type={type} 
                                id={row["id"]} 
                                value={opt["name"]}
                                onChange={this.handleChange}
                                className="form-check-input"
								 disabled={row["readOnly"]}
								   >
                            </input>
                            <label className="form-check-label">{opt["name"]}</label>
                        </div>						
                    ))}
               </div>;
    }

	
	
	createExpression=(type,row,index)=>{

        return  <div className="form-group">
                    <Label >{row["value"]}</Label>
					 
                     
                </div>;
    }
*/

  workspaceClick = (index, e) => {
    this.workspace[index] = !this.workspace[index];
    this.forceUpdate();
    //this.setState(prevState => ({ workspace: !prevState.workspace }));
  };

  render() {
    return (
      <>
        <Modal show={this.showWorkFlow} onHide={this.handleClose}>
          <Modal.Body>
            <div className='form-group' style={{ width: "inherit" }}>
              <div id='bpmnModel' style={{ width: "inherit" }} />
            </div>
          </Modal.Body>
          <Modal.Footer>
            <div
              className='text-center'
              style={{ inlineSize: "-webkit-fill-available" }}
            >
              <Button
                className='form-control'
                style={{ width: 80 }}
                onClick={this.handleClose}
              >
                Close
              </Button>
            </div>
          </Modal.Footer>
        </Modal>

        <form
          method='post'
          style={{ width: "100%" }}
          name='userRegistrationForm'
          onSubmit={this.submituserRegistrationForm}
        >
          {this.createRender(0, 0)}

          {/*<div className="row margin_top2">	 
                        {this.fields.map((row,index)=>(
							row["type"]!=null && row["type"]!="headline-with-line" && row["type"]!="headline"
							?
                            <div className= "col-md-4" key ={index}>
                                {this.createInputControl(row,index)}             
                            </div>
							:
							this.createInputControl(row,index)
                        ))}
                    </div>*/}

          <div className='text-center'>
            <table>
              <thead></thead>
              <tbody>
                <tr>
                  <td>
                    <Button
                      className='form-control'
                      onClick={this.submit}
                      id='submitButton'
                      aria-label='Login'
                    >
                      Submit
                    </Button>
                  </td>
                  <td>
                    <Button
                      className='form-control'
                      onClick={this.showDiagram.bind(this)}
                      id='showDiagram'
                      aria-label='Login'
                    >
                      Show Diagram
                    </Button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </form>
      </>
    );
  }
}

export default FormBuilderSecond;
