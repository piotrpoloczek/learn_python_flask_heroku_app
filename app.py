import os
from flask import Flask, request, render_template, flash, redirect, url_for
from flask_login import LoginManager, login_user, current_user, login_required, logout_user
from werkzeug.utils import secure_filename
from flask_login import LoginManager
from flask_migrate import Migrate

import random
import project.data_manager as data_manager
from project.models import User, db

from project.forms import RegistrationForm, LoginForm


app = Flask(__name__)
app.config.from_object("project.config.Config")
db.init_app(app)

SECRET_KEY = os.urandom(32)
app.config['SECRET_KEY'] = SECRET_KEY

migrate = Migrate(app, db)

login_manager = LoginManager()
login_manager.init_app(app)

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(user_id)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/register', methods = ['POST', 'GET'])
def register():
    form = RegistrationForm()
    if form.validate_on_submit():
        database_user_email = User.query.filter_by(email = form.email.data).first()
        database_user_username = User.query.filter_by(username = form.username.data).first()
        if database_user_email is not None or database_user_username is not None:
            flash('username or email already exists.', 'error')
        else:
            user = User(username = form.username.data, email = form.email.data)
            user.set_password(form.password.data)
            db.session.add(user)
            db.session.commit()
            flash('Succesful registration. Log in to continue.', 'info')
            return redirect(url_for('login'))
    return render_template('registration.html', form = form)

@app.route('/login', methods = ['GET', 'POST'])
def login():
    form = LoginForm()
    if form.validate_on_submit():
        user = User.query.filter_by(email = form.email.data).first()
        print(user)
        if user is not None and user.check_password(form.password.data):
            login_user(user)
            next = request.args.get('next')
            return redirect(next or url_for('index'))
        flash('Invalid email address or password.')
    return render_template('login.html', form = form)

@app.route("/logout")
def logout():
    logout_user()
    return redirect(url_for('index'))



if __name__ == '__main__':
    app.run()
