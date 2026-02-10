import React from 'react'
import PropTypes from 'prop-types'
import { Button } from '@blueprintjs/core'
import exprEval from 'expr-eval'

import SurveyPrompt from './Prompt'

import '../styles/Survey.css'

class Survey extends React.Component {
  constructor(props) {
    super(props)

    this.firstPrompt = this.getNextPrompt(0)
    const firstPromptId = this.props.prompts[this.firstPrompt].id

    // Restore responses from before
    const responses = this.props.responses || {}

    this.parser = new exprEval.Parser()

    this.state = {
      currentPrompt: this.firstPrompt,
      currentValue: responses[firstPromptId] || '',
      validationError: false,
      viewedPrompts: [],
      responses: responses
    }
  }

  // RENDER METHODS //

  render() {
    return (
      <div>
        {this.renderPrompts()}

        <div className="controls">
          {this.renderValidationError()}
          {this.renderBackButton()}
          {this.renderNextButton()}
        </div>
      </div>
    )
  }

  renderPrompts() {
    // All prompts, plus the final confirmation screen, are rendered,
    // but only the active one is visible. This may be somewhat anti-React,
    // but it's needed so the components aren't cleaned up prematurely
    // TODO: render this the right way, I know how to do this now

    let promptList = this.props.prompts.map((prompt, i) => (
      // Hide the prompt unless it is the current one
      <SurveyPrompt
        key={i}
        id={prompt.id}
        promptType={prompt.promptType}
        promptText={prompt.promptText}
        messageText={prompt.messageText}
        condition={prompt.condition}
        skippable={prompt.skippable === 'true'}
        placeholder={prompt.default || ''}
        properties={prompt.properties}
        hidden={this.isPromptHidden(i)}
        defaultValue={this.state.responses[prompt.id]}
        variables={this.getVariables()}
        onChange={this.onResponseChange}
      />
    ))

    return (
      <ul className="prompt-list">
        {promptList}
      </ul>
    )
  }

  renderValidationError() {
    if (this.state.validationError) {
      return (
        <p className="error" role="alert">
          Complete the question above to continue.
        </p>
      )
    }
    else {
      return null
    }
  }

  renderBackButton() {
    return (
      <Button
        className="button-primary"
        onClick={this.goBack}
      >
        <span className="button-icon-left" />
        Back
      </Button>
    )
  }

  renderNextButton() {
    return (
      <Button
        className="button-primary"
        onClick={this.goNext}
      >
        Next
        <span className="button-icon-right" />
      </Button>
    )
  }

  // EVENT HANDLERS //

  goBack = () => {
    // If the user is at the beginning, return control to the parent
    if (this.state.currentPrompt === this.firstPrompt) {
      this.props.onCancel()
    }

    else {
      this.setState((prevState) => {
        const previousIndex = prevState.viewedPrompts.slice(-1)[0]
        const previousPrompt = this.props.prompts[previousIndex]
        const currentPrompt = this.props.prompts[prevState.currentPrompt]

        // Save current value to responses for when we come back
        const newResponses = {
          ...prevState.responses
        }
        newResponses[currentPrompt.id] = prevState.currentValue

        // Pop the current prompt from the stack, and restore the previous one
        // Also restore the old value for that prompt
        return {
          currentPrompt: previousIndex,
          currentValue: prevState.responses[previousPrompt.id] || '',
          validationError: false,
          viewedPrompts: prevState.viewedPrompts.slice(0, -1),
          responses: newResponses
        }
      })
    }
  }

  goNext = () => {
    if (!this.isResponseValid()) {
      this.setState({
        validationError: true
      })
    }

    else {
      this.setState((prevState) => {
        const currentPrompt = this.props.prompts[prevState.currentPrompt]

        // The only way to assign a new value when the id is also a variable
        let newResponses = Object.assign({}, prevState.responses)
        newResponses[currentPrompt.id] = prevState.currentValue

        // Grab the next prompt whose condition passes
        const nextPromptIndex = this.getNextPrompt(prevState.currentPrompt + 1)
        const nextPrompt = this.props.prompts[nextPromptIndex]

        // Blank out responses that were not displayed
        for (let i = prevState.currentPrompt + 1; i < nextPromptIndex; i++) {
          let id = this.props.prompts[i].id
          newResponses[id] = ''
        }

        // Add the current prompt to the viewed stack
        return {
          currentPrompt: nextPromptIndex,
          currentValue: nextPrompt ? (prevState.responses[nextPrompt.id] || '') : '',
          validationError: false,
          viewedPrompts: prevState.viewedPrompts.concat(prevState.currentPrompt),
          responses: newResponses
        }
      }, () => {
        // If the user is at the end, submit responses to the parent
        if (this.isFinished()) {
          const variables = this.getVariables()
          let responses = {
            ...this.state.responses
          }

          // Merge in goal counts if needed
          if (this.props.surveyId === 'nutrition') {
            responses.previousNutritionGoalCount = variables.previousNutritionGoalCount.toString()
          }
          else if (this.props.surveyId === 'physical') {
            responses.previousPhysicalActivityGoalCount = variables.previousPhysicalActivityGoalCount.toString()
          }

          this.props.onFinish(responses)
        }
      })
    }
  }

  onResponseChange = (id, value) => {
    this.setState({
      currentValue: value
    })
  }

  // HELPER METHODS //

  isFinished() {
    return this.state.currentPrompt === this.props.prompts.length
  }

  isPromptHidden(promptNum) {
    const metadata = this.props.prompts[promptNum].ohmagexmeta
    return this.state.currentPrompt !== promptNum || (metadata && metadata.hidden)
  }

  getNextPrompt(startingFrom) {
    let nextPotentialIndex = startingFrom

    while (nextPotentialIndex < this.props.prompts.length) {
      let nextCondition = this.props.prompts[nextPotentialIndex].condition
      let metadata = this.props.prompts[nextPotentialIndex].ohmagexmeta

      // Hidden prompts aren't eligible to be next
      if (!(metadata && metadata.hidden)) {
        // If the next potential prompt has no condition, it's up next
        if (!nextCondition) {
          break
        }

        // If there is a condition and it passes, it's up next
        else if (nextCondition && this.conditionPasses(nextCondition)) {
          break
        }
      }

      // Otherwise, the search continues...
      ++nextPotentialIndex
    }

    return nextPotentialIndex < this.props.prompts.length ? nextPotentialIndex : this.props.prompts.length
  }

  conditionPasses(condition) {
    if (condition) {
      // Use all responses and other variables currently in state
      let variables = this.getVariables()

      // Add the current prompt's value because we might be state transitioning
      const currentPrompt = this.props.prompts[this.state.currentPrompt]
      if (currentPrompt) {
        variables[currentPrompt.id] = this.state.currentValue
      }

      // HTML unescaping: thanks, XML!
      condition = condition.replace(/&lt;/g, '<')
      condition = condition.replace(/&gt;/g, '>')

      const expr = this.parser.parse(condition)

      // Make sure all needed variables are integers (or at least NaN)
      let neededVars = {}
      expr.variables().forEach((v) => {
        neededVars[v] = parseInt(variables[v], 10)
      })

      return expr.evaluate(neededVars)
    }

    else {
      return true
    }
  }

  getVariables() {
    const nutritionChapterNumber = this.state.responses.nutritionChapterSelection || 0
    const physicalChapterNumber = this.state.responses.physicalChapterSelection || 0

    const nutritionChapter = this.props.study.progress[nutritionChapterNumber] || {}
    const physicalChapter = this.props.study.progress[physicalChapterNumber] || {}

    const nutritionCount = nutritionChapter.goalCount || 0
    const nutritionGoal = nutritionChapter.goalFinish || 0
    const physicalCount = physicalChapter.goalCount || 0
    const physicalGoal = physicalChapter.goalFinish || 0

    return {
      ...this.state.responses,
      previousNutritionChapter: nutritionChapter.name || '',
      previousNutritionGoalLongName: nutritionChapter.goalDescription || '',
      previousNutritionGoalCount: nutritionCount,
      previousNutritionGoalAchievementFraction: nutritionCount + '/' + nutritionGoal,
      previousPhysicalActivityChapter: physicalChapter.name || '',
      previousPhysicalActivityGoalLongName: physicalChapter.goalDescription || '',
      previousPhysicalActivityGoalCount: physicalCount,
      previousPhysicalActivityGoalAchievementFraction: physicalCount + '/' + physicalGoal
    }
  }

  isResponseValid() {
    const currentPrompt = this.props.prompts[this.state.currentPrompt]

    // If the current prompt is a message, it's always valid
    if (currentPrompt.messageText) {
      return true
    }

    // Otherwise, blank values are invalid and non-blank ones are valid
    else {
      return this.state.currentValue ? true : false
    }
  }
}

Survey.propTypes = {
  study: PropTypes.object,
  surveyId: PropTypes.string.isRequired,
  prompts: PropTypes.arrayOf(PropTypes.object).isRequired,
  responses: PropTypes.object,
  onCancel: PropTypes.func.isRequired,
  onFinish: PropTypes.func.isRequired
}

export default Survey
