
import "./studentdashboard.css"



const DashBoard = () => {
  return (
    <div className='dashboard'>
      
        <div className="wrapper">
            <div className="textContainer">
                <h3> Join in as Afrolearn</h3>
                <button id="button">Student</button>
                <div className="paragraphText">
                <p>A delicately tailored education for every learner.</p>
                <p>Join Afrolearn to get personalized help with what youre studying or to learn something completely new.</p>
                <p>Well save all of your progress.By signing up for Afrolearn, you agree to our <span>Terms of use</span> and <span>Privacy Policy </span></p>
                </div>
            </div>
            <div className="buttonContainer">
            <button id="button2">Name</button>
            <button id="button3">Date of Birth</button>
            <button id="button">Level of education</button>
            </div>
            <div className="inputContainer">
                <input type="text" placeholder='...................................................' name='name'/>
                
                {/* Dropdown for date of birth */}
                <div className="dobDropdown">
            <select name="day" id="day">
              <option value="" disabled selected>Day</option>
              {/* Add options for days */}
              {Array.from({ length: 31 }, (_, i) => (
                <option key={i + 1} value={i + 1}>{i + 1}</option>
              ))}
            </select>
            <select name="month" id="month">
              <option value="" disabled selected>Month</option>
              {/* Add options for months */}
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i + 1} value={i + 1}>
                  {new Date(0, i).toLocaleString('en-US', { month: 'long' })}
                </option>
              ))}
            </select>
            <select name="year" id="year">
              <option value="" disabled selected>Year</option>
              {/* Add options for years, from 1950 to the current year */}
              {Array.from({ length: new Date().getFullYear() - 1950 + 1 }, (_, i) => (
                <option key={1950 + i} value={1950 + i}>{1950 + i}</option>
              ))}
            </select>
          </div>
            {/* Dropdown for level of education */}
          <div className="educationDropdown">
            <select name="education" id="education">
              <option value="" disabled selected></option>
              <option value="Pre-school">Pre-school</option>
              <option value="Primary 1">Primary 1</option>
              <option value="Primary 2">Primary 2</option>
              <option value="Primary 3">Primary 3</option>
              <option value="Primary 4">Primary 4</option>
              <option value="Primary 5">Primary 5</option>
              <option value="Primary 6">Primary 6</option>
              <option value="Primary 7">Primary 7</option>
              {/* Add more education levels as needed */}
            </select>
          </div>
          {/* End of dropdown for level of education */}
            </div>
        </div>
    </div>
  )
}

export default DashBoard