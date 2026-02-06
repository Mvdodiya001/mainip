import click
import os
from scanner.services import checks

class Context:
    def __init__(self, path, output):
        self.path = path
        self.output = output
        self.checks = checks.Checks()
        pass

@click.command()
@click.option("-p", "--path", type=str, help="Path of the apk")
@click.option("-o", "--output", type=str, help="Path of the output file")
@click.pass_context
def cli(ctx, path, output):
    if not path:
        path = os.getcwd()
    if output:
        if not os.path.splitext(output)[1]:
            output = output + '.json'
    ctx.obj = Context(path, output)
    # click.echo(ctx.obj.path)
    # click.echo(ctx.obj.checks.isValid(ctx.obj.path))
    if not ctx.obj.checks.isValid(ctx.obj.path):
        click.secho("Please give a valid path to apk", bg="red")
    ctx.obj.checks.scan(ctx.obj.path, ctx.obj.output)