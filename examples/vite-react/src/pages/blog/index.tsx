import type { FC } from 'react'
import { Link } from 'react-router'

const Component: FC = () => {
  return (
    <>
      <p>blog/index.tsx</p>
      <Link to="/blog/1b234bk12b3">
        id: 1b234bk12b3
      </Link>
      {' '}
      |
      <Link to="/blog/today">
        today
      </Link>
      {' '}
      |
      <Link to="/blog/today/xxx">
        not exit
      </Link>
    </>
  )
}

export default Component
