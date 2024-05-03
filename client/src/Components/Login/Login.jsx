import React from 'react'
import { Link } from 'react-router-dom'
import './Login.css'

const Login = () => {
  return (
    <div>
        <h1>Login</h1>
        <div className=''></div>
        <a href="/register">To Register</a>
        <a href="/dashboard">To Dashboard</a>
        <div class="login-container">
            <div class="container">
                <div class="image-container">
                    <img src='' alt='login-image' />
                </div>
            </div>
            <div class="login-flow">
                <form class="login-form">
                <h2>Welkom terug!</h2>
                <div class="input-group">
                    <label for="username">E-mail</label>
                    <input type="text" id="username" name="username" required/>
                </div>
                <div class="input-group">
                    <label for="password">Wachtwoord</label>
                    <input type="password" id="password" name="password" required/>
                </div>
                <button type="submit">Login</button>
                </form>
            </div>
        </div>
    </div>
  )
}

export default Login