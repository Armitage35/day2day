import React from 'react';

class SignUp extends React.Component {
	constructor(props){
		super(props);
		this.state = {};

		this.handleSubmit = this.handleSubmit.bind(this);
	}

	handleSubmit(event){
		this.setState({value: event.target.value});
	}

	render(){
		const inputs = [
			{
				name: 'name',
				placeholder: 'Bilbo Baggins',
				type : 'text'
			},
			{
				name: 'email',
				placeholder: 'bbaggins@shire.com',
				type : 'text'
			},
			{
				name: 'password',
				placeholder: '*****',
				type : 'password'
			},
			{
				name: 'repeat password',
				placeholder: '*****',
				type : 'password'
			}
		]

		let inputToDisplay = inputs.map((input, index) => {
			return (
				<React.Fragment>
					<label for={input.name} index={index}>{input.name}</label>
					<input type={input.type} name={input.name} placeholder={input.placeholder} required='' className='authInput' index={index}/>
				</React.Fragment>
			)
		})
		return (
			<React.Fragment>
				<form onSubmit={this.handleSubmit}>
					{inputToDisplay}
					<input type='submit' value='Create an account' />
				</form>
				<button class="bttn-minimal bttn-md bttn-primary">I alerady have an account</button>
			</React.Fragment>
		)}
}

export default SignUp;
