import React, { Component } from 'react';
import moment from 'moment'
import './App.css';

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
        console.log(this.state.addedTasks);

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

        const {
            month,
            selectedDay,
        } = this.state;

        while (!done) {
            weeks.push(
                <Week
                    addingTasks={addingTasks}
                    date={date.clone()}
                    month={month}
                    selectedDay={selectedDay}
                    selectDay={(day) => this.selectDay(day)}
                />);
            date.add(1, "w");
            done = count++ > 3 && monthIndex !== date.month();
            monthIndex = date.month();
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
            </div>
        );
    }
}


class Week extends Component{

    componentWillReceiveProps(newProps) {
        this.setState({addedTask: newProps.addedTasks});
    }

    render(){

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
                <Day day={day}
                     month={month}
                     selectedDay={selectedDay}
                     selectDay={selectDay}
                     addingTasks={addingTasks}
                />
            );

            date = date.clone();
            date.add(1, "day");
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
        this.setState({addedTask: newProps.addedTasks});
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

        let listTasks = filteredList.map((task) => <li className={
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

class DailyTODO extends Component{
    constructor(props){
        super(props);
        this.addItem = this.addItem.bind(this);
        this.state = {
            items: [],
            selectedDay: props.selectedDay,
            newTask: {}
        }
    }

    handleChange(newTask){
        this.props.handleAddingTask(newTask);
    }


    componentWillReceiveProps(props) {
        this.setState(
            {selectedDay: props.selectedDay});
    }

    addItem(e, selectedDay) {
        if (this._inputTask.value !== "") {
            var newTask = {
                text: this._inputTask.value,
                person: this._inputPerson.value,
                date: selectedDay,
                type: this._selectType.value,
                key: Date.now()
            };

            this.setState((prevState) => {
                return {
                    items: prevState.items.concat(newTask),
                    newTask: newTask
                };
            });
            this.handleChange(newTask);
            this._inputTask.value = "";
            this._inputPerson.value = "";
        }

        e.preventDefault();
    }

    render() {
        return (
            <div>
                <div>
                    <form className={"form-add-task"} onSubmit={this.addItem}>
                        <span className={"form-header"}>{this.state.selectedDay.format("DD MMMM YYYY")}</span>
                        <input ref={(a) => this._inputTask = a}
                               placeholder="Task">
                        </input>
                        <input ref={(a) => this._inputPerson = a}
                               placeholder="Person">
                        </input>
                        <select ref={(a) => this._selectType = a}>
                            <option defaultValue={"meeting"} value="meeting">Meeting</option>
                            <option value="trips">Trips</option>
                            <option value="birthday">Birthday</option>
                            <option value="other">Other</option>
                        </select>
                        <button type="submit">Add!</button>
                    </form>
                </div>
            </div>

        );
    }
}




export default Calendar;
