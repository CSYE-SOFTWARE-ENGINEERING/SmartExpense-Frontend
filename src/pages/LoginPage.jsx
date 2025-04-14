
import React from 'react'
import './LoginPage.css'

export default function LoginPage() {
  return (
    <div className="login-page">
      <h2>Login</h2>
      <form>
        <input type="email" placeholder="Email" /><br/>
        <input type="password" placeholder="Password" /><br/>
        <button type="submit">Log In</button>
      </form>
    </div>
  )
}
