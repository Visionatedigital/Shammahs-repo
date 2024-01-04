import style from "./tutorsignup.module.css"

const TutorSignUp = () => {
  return (
    <div className={style.dashboard}>
      <div className={style.wrapper}>
        <div className={style.textContainer}>
        <h3> Join in as Afrolearn</h3>
                <button id={style.button2}>Tutor</button>
                <div className={style.paragraphText}>
                <p>A delicately tailored education for every learner.</p>
                <p>Join Afrolearn to get personalized help with what youre studying or to learn something completely new.</p>
                <p>Well save all of your progress.By signing up for Afrolearn, you agree to our <br />
                 <span>Terms of use</span> and <span>Privacy Policy</span>.</p>
                </div>
        </div>
        
        <div className={style.buttonContainer}>
            <button id={style.button2}>Name</button>
            <button id={style.button3}>Level of Qualification</button>
            <button id={style.button}>School Class</button>
            </div>
        
        <div className={style.inputContainer}>
        <input type="text" placeholder='...................................................' name='name'/>

        <div className={style.NameOfLearner}>
            <select name="education" id={style.education}>
              <option value="" disabled selected></option>
              {/* Add more education levels as needed */}
            </select>
          </div>

          <div className={style.IDNumber}>
            <select name="education" id={style.education}>
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