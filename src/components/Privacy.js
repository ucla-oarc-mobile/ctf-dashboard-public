import React from 'react'
import { Grid, Row, Col } from 'react-flexbox-grid'

import '../styles/Privacy.css'

function Privacy(props) {
  return (
    <Grid fluid>
      <Row>
        <Col xs={12} md={10} mdOffset={1} className="Privacy">
          <h1 className="text-center">
            Privacy Policy
          </h1>

          <p>
            <strong>CoachToFit</strong> provides a mobile platform for health and
            wellness education, management, and tracking so that individuals can
            connect and evaluate progress and goals through mobile access.
            CoachToFit also provides a web interface to view those data in order
            to provide mobile wellness coaching.
          </p>

          <p>
            <strong>"Personal Information"</strong> means information that alone
            or when in combination with other information may be used to readily
            identify, contact, or locate you.
            The CoachToFit app does capture your personal information that you
            enter when you pair a Pebble watch or Bluetooth scale to the app.
            We do not share any of your data for commercial purposes.
          </p>

          <p>
            <strong>"Health Related Information"</strong> means all individually
            identifiable health information, which for CoachToFit means your
            height, weight, activity level and age.
            We treat Health Related Information as Personal Information.
          </p>

          <p>
            <strong>CoachToFit collects your information.</strong> We collect
            personal information when you register to use CoachToFit;
            use CoachToFit on your mobile device; and communicate with us.
            We also collect usage statistics.
          </p>

          <p>
            <strong>Personal Information Collection.</strong> You must register
            to use the CoachToFit app but will not enter your name as part of the
            registration.
            Instead you will enter a study number which will be linked to your
            name on a VA server behind the VA firewall.
            You will enter other Health Related Information.
          </p>

          <p>
            <strong>Use of data.</strong> All personal health data is de-identified.
            Data is displayed in the mobile app and the web dashboard for coaches
            to track progress.
            Subject data is stored for the duration of the study and may be removed
            upon request.
            Security procedures and research best practices are in place to protect
            the confidentiality of your data.
          </p>

          <p>
            <strong>Using CoachToFit.</strong> We collect the information,
            including Personal Information and Health-Related Information,
            you enter into the app or the app collects from your Pebble watch or
            Bluetooth scale.
          </p>

          <p>
            <strong>Cookies, Automatic Data Collection, and Related
            Technologies.</strong> CoachToFit collects and stores information
            that is generated automatically as you use it, including your usage
            statistics, knowledge quizzes, and goals.
            We will also know your mobile device ID (UDID/IMEI), or another
            unique identifier, and mobile operating system.
          </p>

          <p>
            <strong>Consent.</strong> By using this app you consent to our
            privacy policy.
          </p>

          <p>
            <strong>Changes to our Privacy Policy.</strong> If we decide to
            change our privacy policy, we will post the changes at this location,
            and we will note the date it was last modified.
            This policy was last modified on 2/6/18.
          </p>

          <p>
            <strong>Customer Support.</strong> Support is provided by the
            CoachToFit team.
            You can contact us via email at <a href="mailto:VHAPGHCoachtoFit@va.gov">
              VHAPGHCoachtoFit@va.gov
            </a>
          </p>
        </Col>
      </Row>
    </Grid>
  )
}

export default Privacy
