/**
 * This file is for handling the multiple states for our single page app
 * 
 * home
 * welcome
 * login
 * signup, postsignup
 * timer
 * team, stats
 * athletes, new_athlete
 * meets, events
 * progress
 * account
 * 
 * this mainly includes loading the correct assets when the user switches states
 * 
 * Idealy, this should be the only object that knows or has to deal with any states.
 * The other managers should operate under what the state manager tells them given it's needs for that state
 */

var StateManager = {

    current_state : "uninitialized",
    current_state_obj : undefined, // null for now, but used for deconstructing / leaving pages
    state_options : {},

    setOptions(object) {
        this.state_options = object;
    },

    /**
     * will set the state and update the ui
     * 
     * @param {String} state the current sw state
     */
    setState(state) {
        
        // Try running deconstruction function, if implemented
        try {
            if(current_state != "uninitialized") {
                this.current_state_obj.deconstruct();
            }
        } catch(e) {
            console.log("[StateManager]: State \"" + this.current_state + "\" does not have mandatory " +
                        "deconstruct() method implemented! Errors likely!");
        }
        this.current_state = state;
        
        try {
            switch(state) {
                case "home":
                    let home = new homePage()
                    
                    home.onStateSelect((selection) => {
                        this.setState(selection);
                    });

                    home.loadContent();
                    this.current_state_obj = home;
                    break;          
                case "welcome":  
                    let welcome = new welcomePage().onStateSelect((state) => {
                        this.setState(state);
                    });
                    
                    this.current_state_obj = welcome;
                    break;
                case "login":
                // TODO maybe add a loading icon after they submit
                    let login = new loginPage().then((state) => {
                        this.setState(state);
                    }).catch((response) => {
                        console.log("could not login sorry dude");
                    });
                    
                    this.current_state_obj = login;
                    break;
                case "signup":
                    let signup = new signupPage().then((state) => {
                        this.setState(state);
                    }).catch((response) => {
                        console.log("could not sign up becuase: " + response);
                    });
                    
                    this.current_state_obj = signup;
                    break;
                case "postsignup":
                    let postsignup = new postSignupPage();
                    this.current_state_obj = postsignup;
                    break;
                case "stopwatch":
                    let stopwatch = new StopwatchPage();
                    this.current_state_obj = stopwatch;
                    break;
                
                case "beginmeet":
                    let beginMeet = new BeginMeetPage();
                    this.current_state_obj = beginMeet;
                    break;
                case "stats":
                    UIManager.switchToStats();
                    break;
                case "athletes":
                    let athlete = new athletePage();

                    athlete.onAddAthlete(() => {
                        this.setState("add_athlete");
                    });
                    this.current_state_obj = athlete;
                    break;
                case "add_athlete":
                    let add_athlete = new add_athletePage();

                    add_athlete.onAthleteAdded(() => {
                        this.setState("athletes");
                    });
                    this.current_state_obj = add_athlete;
                    break;
                case "meets":
                    let meets = new meetsPage();

                    meets.onAddMeet(() => {
                        console.log("going to add meets");
                        this.setState("add_meet");
                    });
                    this.current_state_obj = meets;
                    break;

                case "add_meet":
                    let add_meet = new add_MeetPage();

                    add_meet.onMeetAdded(() => {
                        console.log("going to meets");
                        this.setState("meets");
                    });
                    this.current_state_obj = add_meet;
                    break;
                case "events":
                    let events = new eventsPage();

                    // when the user clicks on add event
                    events.onAddEvent((add_event) => {
                        this.setState(add_event);
                    });

                    // pass the event object to the add_event page
                    events.onAddAthlete((event) => {
                        this.setOptions(event);
                        this.setState("events_add_athlete");
                    });
                    this.current_state_obj = events;
                    break;
                case "events_add_athlete":
                    let events_add_athlete = new events_add_athletePage(this.state_options);

                    events_add_athlete.onAddAthlete(() => {
                        this.setState("events");
                    });
                    
                    this.current_state_obj = events_add_athlete;
                    break;
                case "add_track_event":
                    let add_track_event = new add_TrackEventPage();
                    add_track_event.onEventAdded(() => {
                        this.setState("events");
                    });
                    this.current_state_obj = add_track_event;
                    break
                case "add_field_event":
                    let add_field_event = new add_FieldEventPage();
                    add_field_event.onEventAdded(() => {
                        this.setState("events");
                    });
                    this.current_state_obj = add_field_event;
                    break;
                case "add_cross_event":
                    let add_event = new add_CrossEventPage();
                    add_event.onEventAdded(() => {
                        this.setState("events");
                    });
                    this.current_state_obj = add_event;
                    break;
                case "progress":
                    UIManager.switchToProgress();
                    break;
                case "account":
                    let account = new accountPage();
                    account.onSignout(() => {
                        UIManager.removeNavigationMenu();
                        this.setState("welcome");
                    });
                    account.onManageTeam(() => {
                        this.setState("team");
                    });
                    this.current_state_obj = account;
                    break;
                case "team":
                    sw_db.selectSingle("SELECT 1 FROM team", []).then((result) => {
                        if (result === false) {
                            //let createTeam = new createTeamPage();
                            // Ask the user if they want to join or create a team
                            let teamInit = new initTeamPage();
                            teamInit.onJoinTeam(() => {
                                this.setState("team_join");
                            });
                            teamInit.onCreateTeam(() => {
                                this.setState("team_create");
                            });
                            this.current_state_obj = teamInit;
                        } else {
                            let manageTeam = new manageTeamPage();
                            this.current_state_obj = manageTeam;
                        }
                    }).catch((error) => {
                        console.log("Team State Error: " + error);
                    });
                    break;
                case "team_join":
                    // TODO: do
                    break;
                case "team_create":
                    let createTeam = new createTeamPage();
                    this.current_state_obj = createTeam;
                    break;
            }    
        } catch (e) {
            console.log("ERROR: " + e);
        }
        
    },

    getState : function(state) {
        return this.current_state;
    }
};