import type { FC } from 'react'
import { useParams } from 'react-router'

const Component: FC = () => {
  const { id } = useParams()
  return (
    <p>
      blog/[id].tsx:
      {' '}
      { id }
    </p>
  )
}

export default Component
