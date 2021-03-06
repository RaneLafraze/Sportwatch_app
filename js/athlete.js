/**
 * this will be used for an easy interface for all of the athletes on the team
 */
function athletePage() {
    let _this = this;
    this.athletes = [];

    $("#app").html(`
    <div class="athlete_menu">
        A-Z/k-12
        <input id="athlete_sort_checkbox" type="checkbox">
        <button id="add_athlete_init">Add Athlete</button>
    </div>

    <div id="athlete_container">
    </div>
    `);
    
    CSSManager.resetStyling();
    CSSManager.addStylesheet("athlete.css");
    
    this.addAthlete = function () {
        throw new Error("AddAthlete is not yet initialized in AthletePage()");
    }

    this.onAddAthlete = (cb) => {
        this.addAthlete = cb;
    }

    this.sortByGrade = function(array) {
        array.sort((a, b) => a.grade - b.grade);
    }
    this.sortByName = function(array) {
        array.sort(function (a, b) {
            if (a.lname.toUpperCase() < b.lname.toUpperCase()) return -1;
            if (a.lname.toUpperCase() > b.lname.toUpperCase()) return 1;
            return 0;
        });
    }

    /**
     * populate the athletes array with all of the athletes in the database
     */
    this.fetchAthletes = () => {
        this.athletes = [];

        sw_db.getAthlete("*").then((result) => {

            for (let index = 0; index < result.length; index++) {

                let fname = result.item(index).fname;
                let lname = result.item(index).lname;
                let grade = result.item(index).grade;
                let gender = result.item(index).gender;

                // TODO add onclick name goto their events
                this.athletes.push({
                    "fname": fname,
                    "lname": lname,
                    "grade": grade,
                    "gender": gender
                });
            }
            this.seperateGenders();
            this.generateAthletes();
        });
    }

    // go to the athlete profile page when you click on their name
    $(document).on("click", ".athlete_information", function () {
        console.log("athlete profile");
        console.log(JSON.stringify($(this).first().html()));
    });

    // remove the athlete when user clicks on X
    $(document).on("click", ".athlete_remove", function () {
        // get the html content of the div and seperate the info into array
        let athlete = $(this).parent().children().eq(0).html().split(" ");
        console.log(JSON.stringify(athlete));
        sw_db.deleteAthlete(athlete);
        $($(this).parent()).remove();
    });

    this.generateAthletes = () => {
        $("#athlete_container").empty();
        $("#athlete_container").append(`
            <div class="athlete_male_container"></div>
            <div class="athlete_female_container"></div>
        `);
        
        
        for (let i = 0; i < this.athletes_m.length; i++) {
            $(".athlete_male_container").append(`
            <div class="athlete_athlete_entry_male">
                <span class="athlete_information">${this.athletes_m[i].fname} ${this.athletes_m[i].lname} ${this.athletes_m[i].grade} ${this.athletes_m[i].gender}</span>
                <button class="athlete_remove">X</button>
            </div>
            `);
        }
        for (let i = 0; i < this.athletes_f.length; i++) {
            $(".athlete_female_container").append(`
                <div class="athlete_athlete_entry_female">
                    <span class="athlete_information">${this.athletes_f[i].fname} ${this.athletes_f[i].lname} ${this.athletes_f[i].grade} ${this.athletes_f[i].gender}</span>
                    <button class="athlete_remove">X</button>
                </div>
            `);
        }
    }


    //TODO FIX THE SORT!!!!
    /**
     * split the athletes array into two seperate arrays
     */
    this.seperateGenders = () => {
        //^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
        // Seperate the athletes into m/f then sort from there
        //.............................................................
        this.athletes_m = [];
        this.athletes_f = [];
        let count_m = 0;
        let count_f = 0;
        for (let i = 0; i < this.athletes.length; i++) {
            if (this.athletes[i].gender === "m") {
                this.athletes_m[count_m] = this.athletes[i];
                count_m += 1;
            }
            if (this.athletes[i].gender === "f") {
                this.athletes_f[count_f] = this.athletes[i];
                count_f += 1;
            }
        }
    }

    $("#athlete_sort_checkbox").change((e) => {
        e.preventDefault();

        this.seperateGenders();

        // sort numerically
        if ($("#athlete_sort_checkbox").is(':checked')) {
            console.log("sorting athletes by grade...");
            this.sortByGrade(this.athletes_m);
            this.sortByGrade(this.athletes_f);
        } else {
            console.log("sorting athletes by last name...");
            this.sortByName(this.athletes_m);
            this.sortByName(this.athletes_f);
        }

        this.generateAthletes();
    });

    // switch to new scene basically
    $("#add_athlete_init").click((e) => {
        e.preventDefault();
        this.addAthlete();
    });

    this.fetchAthletes();
}