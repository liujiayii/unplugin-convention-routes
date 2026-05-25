import type { FC } from 'react'
import { Link } from 'react-router'

const index: FC = () => {
  return (
    <div>
      <p>index.tsx</p>
      <Link to="/blog">
        blog
      </Link>
      {' '}
      |
      <Link to="/about">
        about
      </Link>
      {' '}
      |
      <Link to="/components">
        components
      </Link>
      {' '}
      |
      <Link to="/xxx">
        not exists
      </Link>
    </div>
  )
}

export default index
