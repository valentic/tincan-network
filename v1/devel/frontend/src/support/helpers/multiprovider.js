// Based on https://dev.to/alfredosalzillo/the-react-context-hell-7p4 
// https://github.com/alfredosalzillo/react-pendulum

import React from 'react'

const chainAsChildren = (children, component) => 
    React.cloneElement(component, {}, children)

const MultiProvider = ({ children, providers }) => (
  <>
    {providers.reduceRight(chainAsChildren, children)}
  </>
)

export { MultiProvider }

