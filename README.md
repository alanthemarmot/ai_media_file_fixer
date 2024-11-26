# Alan's Utils Repo

General Code that can be used across projects in work or personally.



# Data Project Template

<a target="_blank" href="https://datalumina.com/">
    <img src="https://img.shields.io/badge/Datalumina-Project%20Template-2856f7" alt="Datalumina Project" />
</a>

## Cookiecutter Data Science
This project template is a simplified version of the [Cookiecutter Data Science](https://cookiecutter-data-science.drivendata.org) template, created to suit the needs of Datalumina and made available as a GitHub template.


## Project Organization

```
├── README.md          <- The top-level README for developers using this project
|
├── snippets_code
|   ├── useful_markdown.md      <- Markdonw file with the basics of Markdown
|   ├── useful_python.py        <- Reusable python
|   ├── useful_shell.sh         <- Reusable shell commands
│   └── genai_snippets
|       ├── openai_connect.py   <- Connection to the OpenAI API in Python
│       └── openai_setup.ipynb  <- Notebook started to use OpenAI
|
├── data
│   ├── external       <- Data from third party sources
│   ├── interim        <- Intermediate data that has been transformed
│   ├── processed      <- The final, canonical data sets for modeling
│   └── raw            <- The original, immutable data dump
│
├── models             <- Trained and serialized models, model predictions, or model summaries
│
├── notebooks          <- Jupyter notebooks. Naming convention is a number (for ordering),
│                         the creator's initials, and a short `-` delimited description, e.g.
│                         `1.0-jqp-initial-data-exploration`
│
├── docs               <- Data dictionaries, manuals, and all other explanatory materials
│
├── reports            <- Generated analysis as HTML, PDF, LaTeX, etc.
│   └── figures        <- Generated graphics and figures to be used in reporting
│
├── requirements.txt   <- The requirements file for reproducing the analysis environment, e.g.
│                         generated with `pip freeze > requirements.txt`
│
└── src                         <- Source code for this project
    │
    ├── __init__.py             <- Makes src a Python module
    │
    ├── config.py               <- Store useful variables and configuration
    │
    ├── dataset.py              <- Scripts to download or generate data
    │
    ├── features.py             <- Code to create features for modeling
    │
    │    
    ├── modeling                
    │   ├── __init__.py 
    │   ├── predict.py          <- Code to run model inference with trained models          
    │   └── train.py            <- Code to train models
    │
    ├── plots.py                <- Code to create visualizations 
    │
    └── services                <- Service classes to connect with external platforms, tools, or APIs
        └── __init__.py 
```

--------




# Common Commands for Various Things

### Virtual Environments (pipenv)

- pipenv --python 3.11                  --> only necessary to use specific version of Python, e.g. prefect project
- pipenv install setuptools             --> install a certain package
- pipenv install -r requirements.txt    --> install all packages from the .txt
- pipenv install pendulum==2.1.2        --> install a certain version of a package
- pipenv install                        --> if in the venv, installas packages from the Pipfile
- pipenv shell                          --> launches virtual env
- pipenv --venv                         --> shows the currently running virtual environment
- exit                                  --> exits virtual env
- deactivate
- pipenv --rm                           --> removes the current virtual environment

- Look for existing Virtual Envs under `~/.local/share/virtualenvs/` directory



### Homebrew commands
brew upgrade                            --> Upgrade all the installed packages


### PIP commands with proxy (Work)
- pip install --proxy=http://itsproxy:21080 ipython
- python -m pip install --proxy=http://itsproxy:21080 --upgrade pip
- pip list
- pip install --proxy=http://itsproxy:21080 --upgrade package_name


### Encrypt/Decrypt a File with a password:
- Encrypt
gpg --output env.gpg --symmetric .env
- Decrypt
gpg --output .env --decrypt env.gpg