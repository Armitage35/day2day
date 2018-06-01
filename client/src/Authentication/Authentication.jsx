import React from 'react';
import SignUp from './SignUp/SignUp.jsx';
import './Authentication.css';

const Authentication = (props) => {



	return (
		<div className='authScreen'>
			<div className='loginBranding'>
				<p>Day2Day</p>
				<div className='nameAndTagline'>
					<p>Welcome to Day2Day</p>
					<p>Your new home page</p>
				</div>
				<div className='social'>
					<a href='https://www.linkedin.com/in/adrien-d-ahlqvist-4179b33b/&quot;' target='_blank' rel='noopener noreferrer'><i class='fab fa-linkedin-in'></i></a>
					<a href='https://github.com/Armitage35' target='_blank' rel='noopener noreferrer'><i class='fab fa-github'></i></a>
				</div>
			</div>
			<div>
				<SignUp />
			</div>
		</div>
	)
}

export default Authentication;