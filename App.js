import React, { Component } from 'react';
import moment from 'moment'
import './App.css';
import {
    BrowserRouter as Router,
    Route,
    Link
} from 'react-router-dom'

class Calendar extends Component{
    constructor(props){
        super(props);

        this.state = {
            month: moment(),
            selectedDay: moment().startOf('day'),
            addedTasks: [],
            newTask: {}
        };

    }

    onAddingTasks(newTask){
        newTask.date = this.state.selectedDay;
        this.setState((prevState) => {
            return {
                newTask: newTask,
                addedTasks: prevState.addedTasks.concat(newTask),
            };
        });

    }

    nextMonth(){
        const {
            month
        } = this.state;

        this.setState({
            month: month.add(1, "month")
        });
    }

    nextYear(){
        const {
            month
        } = this.state;

        this.setState({
            month: month.add(1, "year")
        });
    }

    previousMonth(){
        const {
            month
        } = this.state;

        this.setState({
            month: month.subtract(1, "month")
        });
    }

    previousYear(){
        const {
            month
        } = this.state;

        this.setState({
            month: month.subtract(1, "year")
        });
    }

    selectDay(day){

        this.setState({
            selectedDay: day.date
        })
    }

    buildMonth(addingTasks){
        let weeks = [];
        let done = false;
        let date = this.state.month.clone().startOf("month").add("w" -1).day("Sunday");
        let count = 0;
        let monthIndex = date.month();
        let idWeek = 0

        const {
            month,
            selectedDay,
        } = this.state;

        while (!done) {
            weeks.push(
                <Week
                    key={idWeek}
                    addingTasks={addingTasks}
                    date={date.clone()}
                    month={month}
                    selectedDay={selectedDay}
                    selectDay={(day) => this.selectDay(day)}
                />);
            date.add(1, "w");
            done = count++ > 3 && monthIndex !== date.month();
            monthIndex = date.month();
            idWeek++;
        }

        return weeks;
    }


    renderHeader(){
        const {
            month,
            nextMonth = this.nextMonth.bind(this),
            previousMonth = this.previousMonth.bind(this),
            nextYear = this.nextYear.bind(this),
            previousYear = this.previousYear.bind(this)
        } = this.state;


        return(
            <header>
                <div className="header-month">
                    <i className="fas fa-angle-double-left" onClick={previousYear}></i>
                    <i className="fas fa-angle-left" onClick={previousMonth}></i>
                    <span>{month.format("MMMM, YYYY")}</span>
                    <i className="fas fa-angle-right" onClick={nextMonth}></i>
                    <i className="fas fa-angle-double-right" onClick={nextYear}></i></div>
                <div className="row">
                    <span className="day">PN</span>
                    <span className="day">WT</span>
                    <span className="day">SR</span>
                    <span className="day">CZ</span>
                    <span className="day">PT</span>
                    <span className="day">SO</span>
                    <span className="day">ND</span>
                </div>
            </header>

        )
    }

    render() {
        return (
            <div className={"calendar"}>
                <section>
                    {this.renderHeader()}
                    {this.buildMonth(this.state.addedTasks)}
                </section>
                <DailyTODO handleAddingTask={this.onAddingTasks.bind(this)}
                           addedTask={this.state.addedTasks} selectedDay={this.state.selectedDay}/>
                <DetailsOfTheDay addedTask={this.state.addedTasks} selectedDay={this.state.selectedDay}/>
            </div>
        );
    }
}


class Week extends Component{

    componentWillReceiveProps(newProps) {
        this.setState({addedTask: newProps.addedTasks});
    }

    render(){

        let idDay = 0;
        let days = [];
        let {
            date
        } = this.props

        const {
            month,
            selectedDay,
            selectDay,
            addingTasks
        } = this.props
        for (var i = 0; i < 7; i++) {
            let day = {
                name: date.format("dd"),
                number: date.date(),
                isCurrentMonth: date.month() === month.month(),
                isToday: date.isSame(new Date(), "day"),
                date: date
            };
            days.push(
                <Day
                     key={idDay}
                     day={day}
                     month={month}
                     selectedDay={selectedDay}
                     selectDay={selectDay}
                     addingTasks={addingTasks}
                />
            );

            date = date.clone();
            date.add(1, "day");
            idDay++;
        }

        return (
            <div className="row week" key={days[0]}>
                {days}
            </div>
        );
    }
}

class Day extends React.Component {

    componentWillReceiveProps(newProps) {
        this.setState({addedTask: newProps.addedTasks, selectedDay: newProps.selectedDay});
    }


    renderDay(){
        const {
            day,
            day: {
                date,
                isCurrentMonth,
                isToday,
                number
            },
            selectDay,
            selectedDay,
            addingTasks: addedTasks
        } = this.props;


        let filteredList = addedTasks.filter((task) => task.date.format("DD MM YYYY") === day.date.format("DD MM YYYY"));

        let listTasks = filteredList.map((task) => <li key={task.id} className={
            (task.type === "birthday" ? "birthday" : "")+
            (task.type === "trips" ? "trips" : "")+
            (task.type === "meeting" ? "meeting" : "")+
            (task.type === "other" ? "other" : "")
        }>{task.text}</li>);

        return(
            <div className={"day" + (isToday ? " today" : "")
            + (isCurrentMonth ? "" : " different-month")
            + (date.isSame(selectedDay) ? " selected" : "")}
                 onClick={()=>selectDay(day)}>
            <span className={"day-no"}>
                {number}
            </span>
                <ul className={"task-list"}>{listTasks}</ul>
            </div>
        )
    }

    render() {
        return (
            <div>{this.renderDay()}</div>
        );
    }


}

const Authors = () =>(
    <div>
        <h4>Jakub Kalinowski</h4>
        <h4>Mateusz Bednarski</h4>
    </div>
)

const Home = () =>(
    <div>
        <p>Cool calendar with events, category events, daily view :)</p>
    </div>
)



class DailyTODO extends Component{
    constructor(props){
        super(props);
        this.addItem = this.addItem.bind(this);
        this.state = {
            items: [],
            selectedDay: props.selectedDay,
            newTask: {},
            idTask: 0
        }
    }


    handleChange(newTask){
        this.props.handleAddingTask(newTask);
    }


    componentWillReceiveProps(props) {
        this.setState(
            {selectedDay: props.selectedDay});
    }

    validationForm(newTask){

        let regex = /^[a-zA-Z]+$/;

        if((newTask.text ==='')||(newTask.text === null)){
            alert("Description task must be filled out.");
            return false;
        }
        if((newTask.person === '')||(newTask.person === null)){
            alert("Name person must be filled out.");
            return false;
        }
        if(regex.test(newTask.person)===false){
            alert("Name person must be only letters.");
            return false;
        }
        if(newTask.start.value>newTask.end.value){
            alert("Wrong date.");
            return false;
        }
        return true;
    }

    addItem(e, selectedDay) {
        if (this._inputTask.value !== "") {
            var newTask = {
                text: this._inputTask.value,
                person: this._inputPerson.value,
                date: selectedDay,
                type: this._selectType.value,
                key: Date.now(),
                start: this._inputStart.value,
                end: this._inputEnd.value,
                id: this.state.idTask
            };

            if(this.validationForm(newTask)){
                this.setState((prevState) => {
                    return {
                        items: prevState.items.concat(newTask),
                        newTask: newTask
                    };
                });
                this.handleChange(newTask);
                this._inputTask.value = "";
                this._inputPerson.value = "";
                this._inputStart.value = "";
                this._inputEnd.value = "";
                this.setState((prevState) => {
                    return {
                        idTask: prevState.idTask + 1,
                    };
                });
            }
        }
        e.preventDefault();
    }

    render() {
        return (
            <div>
                <div>
                    <form className={"form-add-task"} onSubmit={this.addItem}>
                        <span className={"form-header"}>{this.state.selectedDay.format("DD MMMM YYYY")}</span>
                        <input ref={(a) => this._inputTask = a} required
                               placeholder="Task">
                        </input>
                        <input ref={(a) => this._inputPerson = a} required
                               placeholder="Person">
                        </input>
                        <input ref={(a) => this._inputStart = a} required type="time"></input>
                        <input ref={(a) => this._inputEnd = a} required type="time"></input>
                        <select ref={(a) => this._selectType = a}>
                            <option defaultValue={"meeting"} value="meeting">Meeting</option>
                            <option value="trips">Trips</option>
                            <option value="birthday">Birthday</option>
                            <option value="other">Other</option>
                        </select>
                        <button type="submit">Add!</button>
                        <Router>
                            <div className={"routing"}>
                                <Route exact path="/authors" component={Authors} />
                                <Route path="/home" component={Home} />
                                <ul className={"routing-list"}>
                                    <li><Link to="/authors">Authors</Link></li>
                                    <li><Link to="/home">Home</Link></li>
                                </ul>
                            </div>
                        </Router>
                    </form>
                </div>
            </div>

        );
    }
}

class DetailsOfTheDay extends Component{

    handleDeleteTask(id){
        for(let i = 0; i < this.props.addedTask.length; i++) {
            if(this.props.addedTask[i].id === id){
                this.props.addedTask.splice(i, 1);
                break;
            }
        }
        this.setState({addedTask: this.props.addedTask});
    }

    componentWillReceiveProps(props) {
        this.setState(
            {selectedDay: props.selectedDay});
    }
    
    render(){
        const{
            addedTask,
            selectedDay
        } = this.props;

        let filteredList = addedTask.filter((task) => task.date.format("DD MM YYYY") === selectedDay.format("DD MM YYYY"));

        let listTasks = filteredList.map((task) => <li key={task.id} className={
            (task.type === "birthday" ? "birthday" : "")+
            (task.type === "trips" ? "trips" : "")+
            (task.type === "meeting" ? "meeting" : "")+
            (task.type === "other" ? "other" : "")
        }>{task.text}, {task.person} {task.start} - {task.end} <button type="button" onClick={() => this.handleDeleteTask(task.id)}><i className="far fa-trash-alt">Usuń!</i> </button></li>);


        return (
            <div className={"day-details"}>
                <ul>{listTasks}</ul>
            </div>
        )
    }
}







export default Calendar;