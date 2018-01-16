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
        this.view = "goal";

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
        this.clearDay = this.clearDay.bind(this);
        this.prev = this.prev.bind(this);
        this.next = this.next.bind(this);
        this.help = this.help.bind(this);
        this.onReorder = this.onReorder.bind(this);
        this.previousDay = this.previousDay.bind(this);
        this.nextDay = this.nextDay.bind(this);
        this.importDay = this.importDay.bind(this);

    }

    render() {
        return (
            <div className="container">
                <div id="top-bar" className="cf">
                    <button onClick={this.previousDay}><i className="fa fa-chevron-left"></i></button>
                    <time>{moment(this.state.date, "MM-DD-YYYY").format("dddd, MMMM Do, YYYY")}</time>
                    <button onClick={this.nextDay}><i className="fa fa-chevron-right"></i></button>
                </div>
                <h1>Points: {this.state[this.state.date].points}</h1>
                <form onSubmit={this.addGoalOrReward} id="the-form">
                    <input name="name" placeholder="Enter Goal" />
                    <input type="number" name="points" placeholder="Points" />
                    <input type="hidden" name="type" value={this.view || "goal"} />
                    <input type="submit" value="+" />
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
                            <span className="streak">Streak</span>
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
                                    <span className="streak">{goal.count > 0 ? (this.getStreak(goal) || 0) : 0}</span>
                                    <span className="button remove" onClick={() => { this.removeGoal(goal.name) }}>✗</span>
                                </div>
                            ))
                        }
                        </Reorder>
                        : (
                            <div className="entry">Please enter a goal to get started.</div>
                        )}
                    </div>
                    <div id="rewards">
                        <h2>Rewards</h2>
                        <div className="entry cf legend">
                            <span className="name">Reward</span>
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
                            <div>Please enter a reward to get started.</div>
                        )}
                    </div>
                </ReactSwipe>
                <div className="bottom-buttons">
                    <button onClick={this.importDay}>Copy Previous Day</button>
                    <button onClick={this.resetScore}>Reset Score</button>
                    <button onClick={this.clearDay}>Clear Day</button>
                </div>
            </div>
        );
    }

    getStreak(goal, streak = 1, date = this.state.date) {
        console.log(goal, streak, date);
        const goalName = goal.name;
        const prevDay = moment(date, "MM-DD-YYYY").add(-1, 'days').format("MM-DD-YYYY");
        if (this.state.hasOwnProperty(prevDay)) {
            const thisGoalIndex = this.state[prevDay].goals.findIndex((goal) => {
                return goal.name == goalName;
            });

            if (thisGoalIndex !== -1) {
                if (this.state[prevDay].goals[thisGoalIndex].count > 0) {
                    streak++;
                    return this.getStreak(goal, streak, prevDay); 
                } else {
                    return streak;
                }
            } else {
                return streak;
            }
        } else {
            return streak;
        }
    }

    importDay() {
        const date = moment(this.state.date, "MM-DD-YYYY").add(-1, 'days').format("MM-DD-YYYY");
        if (this.state.hasOwnProperty(date)) {
            this.setState(() => {
                return {
                    [this.state.date]: {
                        goals: this.state[date].goals.map((goal) => {
                            goal.count = 0;
                            return goal;
                        }),
                        rewards: this.state[date].rewards,
                        points: 0
                    }
                }
            }, () => {
                localStorage.setItem("taskblaster-state", JSON.stringify(this.state));
            });
        }
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
                            goals: prevState[oldDate].goals.map((goal) => {
                                goal.count = 0;
                                return goal;
                            }),
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

    prev() {
        // Show GOALS
        this.reactSwipe.prev();
        this.view = "goals";
        const form = document.getElementById("the-form");
        form.elements['type'].value = "goal";
        form.elements['name'].placeholder = "Enter Goal";
    }

    next() {
        // Show REWARDS
        this.reactSwipe.next();
        this.view = "rewards";
        const form = document.getElementById("the-form");
        form.elements['type'].value = "reward";
        form.elements['name'].placeholder = "Enter Reward";
    }

    help() {
        // Show HELP
        console.log("helping...");
    }

    addGoalOrReward(e) {
        e.preventDefault();

        const name = e.target.name.value.trim();
        let points = e.target.points.value.trim();

        if (Number.isNaN(points) || points <= 0)
            points = 1;

        if (name.length <= 0) {
            alert("Please enter a goal or reward.");
            return false;
        }

        const GoalOrReward = {
            name: name,
            points: points
        }
        const type = e.target.type.value;
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
                        goals: prevState[this.state.date].goals,
                        rewards: prevState[this.state.date].rewards.concat(GoalOrReward),
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

    clearDay() {
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

