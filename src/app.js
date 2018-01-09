import React from 'react';
import ReactDOM from 'react-dom';
import ReactSwipe from 'react-swipe';
import Reorder from 'react-reorder';
import './styles/styles.scss';

class App extends React.Component {

    constructor(props) {
        super(props);
        this.state = {};

        if (localStorage.getItem("taskblaster-state") !== null) {
            this.state = JSON.parse(localStorage.getItem("taskblaster-state"));
        } else {
            this.state = {
                goals: [],
                rewards: [],
                points: 0
            };
        }

        this.addGoalOrReward = this.addGoalOrReward.bind(this);
        this.addCount = this.addCount.bind(this);
        this.removeGoal = this.removeGoal.bind(this);
        this.resetScore = this.resetScore.bind(this);
        this.clearEverything = this.clearEverything.bind(this);
        this.prev = this.prev.bind(this);
        this.next = this.next.bind(this);
    }

    render() {
        return (
            <div>
                <h1>Points: {this.state.points}</h1>
                <button onClick={this.prev}>Goals</button>
                <button onClick={this.next}>Rewards</button>
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
                <ReactSwipe key={2} className="swipe" ref={reactSwipe => this.reactSwipe = reactSwipe} swipeOptions={{continuous: false}}>
                    <div id="goals">
                        <h2>Goals</h2>
                        {this.state.goals.length > 0 ? 
                            this.state.goals.map((goal) => (
                                <p key={goal.name}>{goal.name}: {goal.points} <button onClick={() => { this.addCount(goal.name) }}>Done'd</button> ({goal.count})<button onClick={() => { this.removeGoal(goal.name) }}>X</button></p>
                            )
                        ) : (
                            <div>Please enter a goal to get started.</div>
                        )}
                    </div>
                    <div id="rewards">
                        <h2>Rewards</h2>
                        {this.state.rewards.length > 0 ?
                            this.state.rewards.map((reward) => (
                                <p key={reward.name} className={this.state.points >= reward.points ? "good" : ""}>{reward.name}: {reward.points}</p>
                            )
                        ) : (
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
                    goals: prevState.goals.concat(GoalOrReward)
                }
            } else {
                return {
                    rewards: prevState.rewards.concat(GoalOrReward)
                }
            }
        }, () => {
            localStorage.setItem("taskblaster-state", JSON.stringify(this.state));
        });
        e.target.name.value = '';
        e.target.points.value = '';
    }

    addCount(goalName) {
        const thisGoalIndex = this.state.goals.findIndex((goal) => {
            return goal.name == goalName;
        });
        this.setState((prevState) => {
            const goals = prevState.goals;
            goals[thisGoalIndex].count++;
            const points = Number(prevState.points) + Number(goals[thisGoalIndex].points);
            return {
                goals,
                points
            }
        }, () => {
            localStorage.setItem("taskblaster-state", JSON.stringify(this.state));
        });
    }

    removeGoal(goalName) {
        this.setState((prevState) => {
            return {
                goals: prevState.goals.filter((goal) => (
                    goal.name !== goalName
                ))
            }
        }, () => {
            localStorage.setItem("taskblaster-state", JSON.stringify(this.state));
        });
    }

    resetScore() {
        this.setState((prevState) => {
            return {
                goals: prevState.goals.map((goal) => {
                    goal.count = 0;
                    return goal;
                }),
                points: 0
            }
        }, () => {
            localStorage.setItem("taskblaster-state", JSON.stringify(this.state));
        });
    }

    clearEverything() {
        this.setState(() => {
            return {
                goals: [],
                rewards: [],
                points: 0
            }
        }, () => {
            localStorage.setItem("taskblaster-state", JSON.stringify(this.state));
        });
    }

}

ReactDOM.render(<App />, document.getElementById("app"));

