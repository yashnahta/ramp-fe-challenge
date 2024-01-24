import classNames from "classnames"
import { useRef, useState } from "react"
import { InputCheckboxComponent } from "./types"

export const InputCheckbox: InputCheckboxComponent = ({ id, checked = false, disabled, onChange }) => {
  const { current: inputId } = useRef(`RampInputCheckbox-${id}`)


  /*Bug 2 : Firing event from label element instead of input element*/
  return (
    <div className="RampInputCheckbox--container" data-testid={inputId}>
      <label
        className={classNames("RampInputCheckbox--label", {
          "RampInputCheckbox--label-checked": checked,
          "RampInputCheckbox--label-disabled": disabled,
        })}
        onClick={() => {
          onChange(!checked)
        }}
        
      />
      <input
        id={inputId}
        type="checkbox"
        className="RampInputCheckbox--input"
        onChange={ () => {
          onChange(!checked);
        }}
      />
    </div>
  )
}
