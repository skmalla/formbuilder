import React, { Component } from "react";
import Cookies from "universal-cookie";

import {
  Label,
  Input,
  Button,
  Card,
  CardHeader,
  CardBody,
  UncontrolledCollapse,
} from "reactstrap";
import { Tab } from "react-bootstrap-tabs/dist";
import {
  fieldEdited,
  createInputControl,
  validationCheck,
  fieldTypeAheadEdited,
  createRender,
  popover,
  deleteDocument,
} from "./CommonFunction.js";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronUp, faChevronDown } from "@fortawesome/free-solid-svg-icons";
import { Modal } from "react-bootstrap";

class FormBuilder extends Component {
  constructor(props) {
    super(props);
    //	this.state = { workspace: true};
    this.workspace = [];
    /*this.state ={
			people:'',
			peopleJson:[],
			isLoading:false
		};*/
    this.data = [];
    this.showMenu = false;
    this.allUploadFiles = [];
    this.fileUploadArray = [];
    this.showModalVariable = false;
    this.fieldIndex = 0;
    this.workspaceIndex = 0;
    this.peopleNameJson = [];
    this.peopleIdJson = [];
    this.groupNameJson = [];
    this.groupIdJson = [];
    this.monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    this.body = this.props.body;

    this.formId = this.body["id"];
    this.fields = this.body["fields"];
    this.processId = this.body["processId"];
    this.processName = this.body["processName"];
    this.fieldEdited = fieldEdited.bind(this);
    this.fieldTypeAheadEdited = fieldTypeAheadEdited.bind(this);
    this.validationCheck = validationCheck.bind(this);
    this.createInputControl = createInputControl.bind(this);
    this.popover = popover.bind(this);
    this.deleteDocument = deleteDocument.bind(this);

    this.workspaceClick = this.workspaceClick.bind(this);

    //this.closeModal = this.closeModal.bind(this);

    // this.createCardHeader = createCardHeader.bind(this);
    //this.createCardBody = createCardBody.bind(this);
    this.createRender = createRender.bind(this);

    this.values = {};
    console.log(this.fields);
    for (var i = 0; i < this.fields.length; i++) {
      //this.fileUploadArray.push(false);

      this.values[this.fields[i]["id"]] = this.fields[i]["value"];
      if (this.fields[i]["value"] == null) this.fields[i]["value"] = "";
    }

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
    console.log(this.innerFields);
    this.div = "<div>";
    this.endDiv = "</div>";
  }

  th = (date) => {
    if (date > 3 && date < 21) return "th";
    switch (date % 10) {
      case 1:
        return "st";
      case 2:
        return "nd";
      case 3:
        return "rd";
      default:
        return "th";
    }
  };

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
		}*/

      if (validationSuccess) {
        var todayDate = new Date();

        var dateMonth =
          this.monthNames[todayDate.getMonth()] +
          " " +
          todayDate.getDate() +
          this.th(todayDate.getDate()) +
          " " +
          todayDate.getFullYear();

        var json = {};
        json["processDefinitionId"] = this.processId;
        json["name"] = this.processName + " - " + dateMonth;
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
            "flowable-task/app/rest/process-instances/",
          requestBody
        );

        if (!response.ok) {
          alert("error");
        } else {
          var body = await response.json();
          var processInstanceId = body["id"];
          alert("success");
        }
      }
    } catch (error) {
      alert("error");
    }
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
      /*   var id = e.target.getAttribute('id');

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
			}else{
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

  /*createInputControl=(row,index)=>{

        switch(row["type"]){
            
            case "text" : 
            case "integer" :
            case "decimal" : 
                return this.createInputFieldByType("text",row,index);
                
            case "upload" : 
                return this.createInputFieldByType("file",row,index);

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
	
	 */

  /*createInputFieldByType=(type,row,index)=>{

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
						 disabled={row["readOnly"]}
                        ></Input>
                </div>;
    }*/

  /*createTextArea=(row,index)=>{
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

  forceUpdateFumction = () => {};
  render() {
    let fieldIndex = 0;
    let workspaceIndex = 0;
    return (
      <>
        <Modal show={this.showModalVariable} onHide={this.closeModal}>
          <Modal.Body>
            <div className='form-group' style={{ width: "inherit" }}>
              <div id='uploadDocument' style={{ width: "inherit" }} />
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
                onClick={this.closeModal}
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
					 Boolean(row["type"]!=null && (row["type"]!="headline-with-line" ))
							?
                            (<div className= "col-md-4" key ={index}>
                                {this.createInputControl(row,index)}             
                            </div>)
							:
							(this.createInputControl(row,index))
								
                        ))}
					</div>*/}

          <div className='text-center'>
            <table>
              <thead></thead>
              <tbody>
                <tr>
                  <td>
                    <Button
                      onClick={this.submit}
                      id='submitButton'
                      aria-label='Login'
                      className='mt-4'
                      style={{ borderRadius: "10px", fontSize: "16px" }}
                    >
                      Submit
                    </Button>
                  </td>
                  {/* <td>
                        <Button className="form-control" onClick={this.showDiagram.bind(this)} id = "showDiagram" aria-label="Login">Show Diagram</Button>
                      </td> */}
                </tr>
              </tbody>
            </table>
          </div>
        </form>
      </>
    );
  }
}

export default FormBuilder;
