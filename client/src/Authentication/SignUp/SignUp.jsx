import React from 'react';

const SignUp = (props) => {
	return (
		<form method='post'>
			<label for='username'>Name</label>
			<input type='text' name='name' id='username' placeholder='Bilbo Baggins' required='' />
			<label for='email'>Email</label>
			<input type='text' name='email' id='email' placeholder='bbaggins@shire.com' required='' />
			<label for='password'>Password</label>
			<input type='password' name='password' id='password' placeholder='********' required='' />
			<label for='passwordRepeat'>Repeat Password</label>
			<input type='password' name='passwordRepeat' id='passwordRepeat' placeholder='********' required='' />
			{/* eslint-disable-next-line
			<input type='button' value='Create an account' type='submit' />
			*/}
			<a href=''>I alerady have an account</a>
		</form>
	)
}

export default SignUp;
