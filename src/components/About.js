import React from 'react'

import '../styles/About.css'
import appScreenshots from '../images/appScreenshots.png'
import oarcLogo from '../images/oarc.svg'

class About extends React.Component {
  render() {
    return (
      <div className="About">
        <h1>
          The Coach to Fit Program
        </h1>

        <div className="gradient">
          The CoachtoFit program is managed out of the VA Pittsburgh location.
          The CoachtoFit app is for a veterans' closed study,
          governed by the IRB at the US Department of Veterans Affairs.
        </div>

        <img
          src={appScreenshots}
          alt="Screenshots of the app"
          className="screenshots"
        />

        <p className="description">
          The CoachtoFit program includes an app (either iOS or Android)
          as well as a peer coaching web dashboard that facilitates and
          educates users on diet and exercise.
          It helps the users set personalized goals,
          track weight and work on their exercise progress.
          It teaches users to balance what they eat,
          how much they eat and how physically active they are.
          It also enables management by administrators and peer coaches
          to track adherence to the program.
          It leverages either GoogleFit or Apple's HealthKit
          (via the iOS Health App) to count steps and help the user track
          activity and exercise and weight measurements.
        </p>

        <p className="description">
          This app is meant for the special population of people with
          Serious Mental Illness (SMI).
          People with Serious Mental Illness die 15 years prematurely due to
          cardiovascular illness and cancer and high rates of obesity.
          Excess weight contributes to chronic pain, stroke, heart disease,
          diabetes, poor self-image, depression, cancer, high blood pressure,
          sleep apnea, liver failure.
          In-person weight management can be effective.
          Specialized programs are in treatment guidelines but require major
          clinician time &amp; patient travel but such in-person programs are
          rarely actually provided.
        </p>

        <p className="contact">
          Contact:&nbsp;
          <a href="mailto:VHAPGHCoachtoFit@va.gov">
            VHAPGHCoachtoFit@va.gov
          </a>
        </p>

        <div className="oarc">
          <a href="https://oarc.ucla.edu/">
            <img
              src={oarcLogo}
              alt="In partnership with UCLA Advanced Research Computing"
            />
          </a>
        </div>
      </div>
    )
  }
}

export default About
