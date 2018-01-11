import React from 'react';
import ReactDOM from 'react-dom';
import ReactSwipe from 'react-swipe';
import Reorder, { reorder } from 'react-reorder';
import moment from 'moment';
import Moment from 'react-moment';
import './styles/styles.scss';

class App extends React.Component {

    constructor(props) {
        super(props);
        this.state = {};
        this.currentDate = moment().format("MM-DD-YYYY");

        if (localStorage.getItem("taskblaster-state") !== null) {
            this.state = JSON.parse(localStorage.getItem("taskblaster-state"));
        } else {
            this.state = {
                date: this.currentDate
            }
            this.state[this.currentDate] = {
                goals: [],
                rewards: [],
                points: 0
            }
        }

        this.addGoalOrReward = this.addGoalOrReward.bind(this);
        this.addCount = this.addCount.bind(this);
        this.removeGoal = this.removeGoal.bind(this);
        this.resetScore = this.resetScore.bind(this);
        this.clearEverything = this.clearEverything.bind(this);
        this.prev = this.prev.bind(this);
        this.next = this.next.bind(this);
        this.help = this.help.bind(this);
        this.onReorder = this.onReorder.bind(this);
        this.previousDay = this.previousDay.bind(this);
        this.nextDay = this.nextDay.bind(this);

    }

    previousDay() {
        const date = moment(this.state.date, "MM-DD-YYYY").add(-1, 'days').format("MM-DD-YYYY");
        if (this.state.hasOwnProperty(date)) {
            this.setState((prevState) => {
                return {
                    date
                }
            }, () => {
                localStorage.setItem("taskblaster-state", JSON.stringify(this.state));
            });
        }
    }

    nextDay() {
        if (moment(this.state.date, "MM-DD-YYYY").diff(moment(), "days") < 0) {
            const oldDate = this.state.date;
            const date = moment(this.state.date, "MM-DD-YYYY").add(1, 'days').format("MM-DD-YYYY");
            this.setState((prevState) => {
                if (this.state.hasOwnProperty(date)) {
                    return {
                        date
                    }
                } else {
                    return {
                        date,
                        [date]: {
                            goals: prevState[oldDate].goals,
                            rewards: prevState[oldDate].rewards,
                            points: 0
                        }
                    }
                }
            }, () => {
                localStorage.setItem("taskblaster-state", JSON.stringify(this.state));
            });
        }
    }

    render() {
        return (
            <div className="container">
                <div id="top-bar">
                    <button onClick={this.previousDay}>PREV</button>
                    {moment(this.state.date, "MM-DD-YYYY").format("dddd, MMMM Do, YYYY")}
                    <button onClick={this.nextDay}>NEXT</button>
                </div>
                <h1>Points: {this.state[this.state.date].points}</h1>
                <form onSubmit={this.addGoalOrReward}>
                    <input name="name" />
                    <input name="points" />
                    <div className="pretty p-switch p-fill">
                        <span>Goal</span>
                        <input type="checkbox" name="type" />
                        <div className="state">
                            <label></label>
                        </div>
                        <span>Reward</span>
                    </div>
                    <input type="submit" />
                </form>
                <div className="cf view-buttons">
                    <button id="show-goals" onClick={this.prev}>Goals</button>
                    <button id="show-rewards" onClick={this.next}>Rewards</button>
                    <button id="show-help" onClick={this.help}>?</button>
                </div>
                <ReactSwipe key={2} className="swipe" ref={reactSwipe => this.reactSwipe = reactSwipe} swipeOptions={{continuous: false}}>
                    <div id="goals">
                        <h2>Goals</h2>
                        <div className="entry cf legend">
                            <span className="empty">&nbsp;</span>
                            <span className="name">Goal</span>
                            <span className="points">Points</span>
                            <span className="count">Count</span>
                            <span className="empty">&nbsp;</span>
                        </div>
                        {this.state[this.state.date].goals.length > 0 ? 
                        <Reorder
                            reorderId="goals-reorder"
                            className="reorder goals"
                            onReorder={this.onReorder}
                            mouseHoldTime={500}
                            lock="horizontal"
                        >
                        {
                            this.state[this.state.date].goals.map((goal) => (
                                <div key={goal.name} className="entry cf">
                                    <span className="button done" onClick={() => { this.addCount(goal.name) }}>✓</span>
                                    <span className="name">{goal.name}</span>
                                    <span className="points">{goal.points}</span>
                                    <span className="count">{goal.count}</span>
                                    <span className="button remove" onClick={() => { this.removeGoal(goal.name) }}>✗</span>
                                </div>
                            ))
                        }
                        </Reorder>
                        : (
                            <div>Please enter a goal to get started.</div>
                        )}
                    </div>
                    <div id="rewards">
                        <h2>Rewards</h2>
                        <div className="entry cf legend">
                            <span className="name">Name</span>
                            <span className="points">Points</span>
                        </div>
                        {this.state[this.state.date].rewards.length > 0 ?
                        <Reorder
                            reorderId="rewards-reorder"
                            className="reorder rewards"
                            placeholderClassName="placeholder reward"
                            onReorder={this.onReorder}
                            mouseHoldTime={500}
                            lock="horizontal"
                        >
                        {
                            this.state[this.state.date].rewards.map((reward) => (
                                <div key={reward.name} className={"cf entry " + (this.state[this.state.date].points >= reward.points ? "met" : "")}>
                                    <span className="reward name">{reward.name}</span>
                                    <span className="reward points">{reward.points}</span>
                                    <span className="reward remove" onClick={() => { this.removeReward(reward.name) }}>✗</span>
                                </div>
                            ))
                        }
                        </Reorder>
                        : (
                            <div>Please enter a reward.</div>
                        )}
                    </div>
                </ReactSwipe>
                <button onClick={this.resetScore}>Reset Score</button>
                <button onClick={this.clearEverything}>Clear Everything</button>
            </div>
        );
    }

    prev() {
        this.reactSwipe.prev();
    }

    next() {
        this.reactSwipe.next();
    }

    help() {
        console.log("helping...");
    }

    addGoalOrReward(e) {
        e.preventDefault();
        const GoalOrReward = {
            name: e.target.name.value,
            points: e.target.points.value
        }
        const type = (e.target.type.checked) ? "reward" : "goal";
        this.setState((prevState) => {
            if (type == "goal") { 
                GoalOrReward.count = 0;
                return {
                    [this.state.date]: {
                        goals: prevState[this.state.date].goals.concat(GoalOrReward),
                        rewards: prevState[this.state.date].rewards,
                        points: prevState[this.state.date].points
                    }
                }
            } else {
                return {
                    [this.state.date]: {
                        rewards: prevState[this.state.date].rewards.concat(GoalOrReward),
                        goals: prevState[this.state.date].goals,
                        points: prevState[this.state.date].points
                    }
                }
            }
        }, () => {
            localStorage.setItem("taskblaster-state", JSON.stringify(this.state));
        });
        e.target.name.value = '';
        e.target.points.value = '';
    }

    addCount(goalName) {
        const thisGoalIndex = this.state[this.state.date].goals.findIndex((goal) => {
            return goal.name == goalName;
        });
        this.setState((prevState) => {
            const goals = prevState[this.state.date].goals;
            goals[thisGoalIndex].count++;
            const points = Number(prevState[this.state.date].points) + Number(goals[thisGoalIndex].points);
            return {
                [this.state.date]: {
                    goals: goals,
                    rewards: prevState[this.state.date].rewards,
                    points: points
                }
            }
        }, () => {
            localStorage.setItem("taskblaster-state", JSON.stringify(this.state));
        });
    }

    removeGoal(goalName) {
        this.setState((prevState) => {
            return {
                [this.state.date]: {
                    goals: prevState[this.state.date].goals.filter((goal) => (
                        goal.name !== goalName
                    )),
                    rewards: prevState[this.state.date].rewards,
                    points: prevState[this.state.date].points
                }
            }
        }, () => {
            localStorage.setItem("taskblaster-state", JSON.stringify(this.state));
        });
    }

    removeReward(rewardName) {
        this.setState((prevState) => {
            return {
                [this.state.date]: {
                    rewards: prevState[this.state.date].rewards.filter((reward) => (
                        reward.name !== rewardName
                    )),
                    goals: prevState[this.state.date].goals,
                    points: prevState[this.state.date].points
                }
            }
        }, () => {
            localStorage.setItem("taskblaster-state", JSON.stringify(this.state));
        });
    }

    resetScore() {
        this.setState((prevState) => {
            return {
                [this.state.date]: {
                    goals: prevState[this.state.date].goals.map((goal) => {
                        goal.count = 0;
                        return goal;
                    }),
                    rewards: prevState[this.state.date].rewards,
                    points: 0
                }
            }
        }, () => {
            localStorage.setItem("taskblaster-state", JSON.stringify(this.state));
        });
    }

    clearEverything() {
        this.setState(() => {
            return {
                [this.state.date]: {
                    goals: [],
                    rewards: [],
                    points: 0
                }
            }
        }, () => {
            localStorage.setItem("taskblaster-state", JSON.stringify(this.state));
        });
    }

    onReorder(event, previousIndex, nextIndex, fromId, toId) {
        this.setState((prevState) => {
            if (event.target.classList.contains("reward")) {
                return {
                    [this.state.date]: {
                        rewards: reorder(this.state[this.state.date].rewards, previousIndex, nextIndex),
                        goals: prevState[this.state.date].goals,
                        points: prevState[this.state.date].points
                    }
                }
            } else {
                return {
                    [this.state.date]: {
                        goals: reorder(this.state[this.state.date].goals, previousIndex, nextIndex),
                        rewards: prevState[this.state.date].rewards,
                        points: prevState[this.state.date].points
                    }
                }
            }
        }, () => {
            localStorage.setItem("taskblaster-state", JSON.stringify(this.state));
        });
    }

}

ReactDOM.render(<App />, document.getElementById("app"));

