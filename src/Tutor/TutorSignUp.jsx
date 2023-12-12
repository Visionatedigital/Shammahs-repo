

const TutorSignUp = () => {
  return (
    <div className="dashboard">
      <div className="wrapper">
        <div className="textContainer">
        <h3> Join in as Afrolearn</h3>
                <button id="button2">Tutor</button>
                <div className="paragraphText">
                <p>A delicately tailored education for every learner.</p>
                <p>Join Afrolearn to get personalized help with what youre studying or to learn something completely new.</p>
                <p>Well save all of your progress.By signing up for Afrolearn, you agree to our <br />
                 <span>Terms of use</span> and <span>Privacy Policy</span>.</p>
                </div>
        </div>
        
        <div className="buttonContainer">
            <button id="button2">Name</button>
            <button id="button3">Level of Qualification</button>
            <button id="button">School Class</button>
            </div>
        
        <div className="inputContainer">
        <input type="text" placeholder='...................................................' name='name'/>

        <div className="Name-of-learner">
            <select name="education" id="education">
              <option value="" disabled selected></option>
              {/* Add more education levels as needed */}
            </select>
          </div>

          <div className="ID-number">
            <select name="education" id="education">
              <option value="" disabled selected></option>
              {/* Add more education levels as needed */}
            </select>
          </div>


        </div>
      </div>
    </div>
  )
}

export default TutorSignUp